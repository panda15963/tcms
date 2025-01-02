import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

/**
 * 날짜를 ISO 로컬 형식으로 변환
 * @param {Date} date - 변환할 날짜 객체
 * @returns {string} 변환된 날짜 문자열 (YYYY-MM-DD 형식)
 */
const formatMonthDateToLocalISO = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    console.error('Invalid date:', date);
    return ''; // Return empty string for invalid dates
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * LineChart 컴포넌트 - 데이터를 시각화하기 위한 라인 차트
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {Array} props.data - 차트에 표시할 데이터 배열
 * @param {string} props.groupBy - 데이터를 그룹화할 기준 (예: 'tools' 또는 'toolver')
 * @returns {JSX.Element} 차트를 렌더링할 SVG 또는 데이터 없음 메시지
 */
const LineChart = ({ data, groupBy, dateTerm = 'day' }) => {
  const { t } = useTranslation(); // 다국어 번역 훅
  const svgRef = useRef(); // SVG 요소를 참조하는 ref

  // 차트 여백 및 크기 설정
  const margin = { top: 60, right: 20, bottom: 50, left: 70 };
  const width = 1200 - margin.left - margin.right; // 차트 너비
  const height = 500 - margin.top - margin.bottom; // 차트 높이

  // 데이터를 그룹화할 기준 (toolname 또는 toolver)
  const groupKey = groupBy === 'tools' ? 'toolname' : 'toolver';

  /**
   * 데이터를 그룹화하여 차트에 표시할 형식으로 변환
   */
  const groupedData = data
    ? Array.from(
        d3.group(data, (d) => d[groupKey]),
        ([key, entries]) => ({
          key,
          data: entries.map((entry) => {
            const date = new Date(entry.date);
            if (isNaN(date)) {
              console.error('Invalid date entry:', entry);
            }
            return {
              date: formatMonthDateToLocalISO(date),
              value: entry.count,
            };
          }),
        })
      )
    : [];

  useEffect(() => {
    // 데이터가 없는 경우 차트를 초기화하고 반환
    if (!groupedData || groupedData.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove(); // 기존 요소 제거
      return;
    }

    // SVG 초기화
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right) // 전체 너비 설정
      .attr('height', height + margin.top + margin.bottom) // 전체 높이 설정
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`); // 여백 적용

    // 툴팁 생성
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('padding', '5px 10px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0); // 기본적으로 숨김 상태

    // 차트의 모든 날짜 및 값 추출
    const allDates = groupedData.flatMap((group) =>
      group.data.map((d) => new Date(d.date))
    );

    const allValues = groupedData.flatMap((group) =>
      group.data.map((d) => d.value)
    );

    const validDates = allDates.filter(
      (date) => date instanceof Date && !isNaN(date)
    );
    if (validDates.length === 0) {
      console.error('No valid dates found in the data.');
      return; // Exit the useEffect or function to avoid further errors
    }

    // 날짜 및 값 범위 설정
    const minDate = d3.min(validDates); // 최소 날짜
    const maxDate = d3.max(validDates); // 최대 날짜
    if (!minDate || !maxDate) {
      console.error('Invalid date range. Min or Max date is undefined.');
      return; // Exit to avoid further errors
    }

    const paddedMinDate = new Date(minDate);
    paddedMinDate.setDate(minDate.getDate() - 1); // 최소 날짜 패딩

    const paddedMaxDate = new Date(maxDate);
    paddedMaxDate.setDate(maxDate.getDate() + 1); // 최대 날짜 패딩

    // X축 스케일 설정
    const xScale = d3
      .scaleTime()
      .domain([paddedMinDate, paddedMaxDate])
      .range([0, width]);

    // Y축 스케일 설정
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allValues)]) // 최대값 기준으로 스케일 설정
      .range([height, 0]);

    // 라인 생성기
    const line = d3
      .line()
      .x((d) => xScale(new Date(d.date))) // X축 스케일에 날짜 매핑
      .y((d) => yScale(d.value)) // Y축 스케일에 값 매핑
      .curve(d3.curveMonotoneX); // 부드러운 곡선 적용

    // 색상 스케일
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // 그룹별 라인과 데이터 포인트 추가
    groupedData.forEach((group, idx) => {
      // 데이터 라인 추가
      if (group.data.length > 1) {
        svg
          .append('path')
          .datum(group.data) // 그룹 데이터를 경로에 연결
          .attr('fill', 'none') // 채우기 없음
          .attr('stroke', colorScale(idx)) // 그룹별 색상
          .attr('stroke-width', 2) // 라인 두께
          .attr('d', line) // 초기 라인 경로
          .attr('stroke-dasharray', function () {
            const totalLength = this.getTotalLength();
            return `${totalLength} ${totalLength}`; // 총 길이를 구해서 dash 배열 설정
          })
          .attr('stroke-dashoffset', function () {
            return this.getTotalLength(); // 처음에는 전체가 숨겨짐
          })
          .transition()
          .duration(2000) // 애니메이션 시간 (ms)
          .ease(d3.easeLinear) // 선형 보간
          .attr('stroke-dashoffset', 0); // 완전히 보이도록 설정
      }

      // 데이터 포인트 추가
      group.data.forEach((point) => {
        svg
          .append('circle')
          .attr('cx', xScale(new Date(point.date))) // X축 위치
          .attr('cy', yScale(point.value)) // Y축 위치
          .attr('r', 5) // 점 크기
          .attr('fill', colorScale(idx)) // 색상
          .attr('stroke', 'black') // 외곽선 색상
          .attr('stroke-width', 1) // 외곽선 두께
          .on('mouseover', (event) => {
            tooltip
              .style('opacity', 1) // 툴팁 표시
              .html(
                `<strong>${group.key}</strong><br>${t('LineChart.Date')}: ${
                  point.date
                }<br>${t('LineChart.Value')}: ${point.value}`
              );
          })
          .on('mousemove', (event) => {
            tooltip
              .style('left', event.pageX + 10 + 'px') // 툴팁 X 위치
              .style('top', event.pageY - 30 + 'px'); // 툴팁 Y 위치
          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0); // 툴팁 숨김
          });
      });

      // 범례 추가
      svg
        .append('line')
        .attr('x1', width - 150)
        .attr('y1', idx * 15 - 45)
        .attr('x2', width - 120)
        .attr('y2', idx * 15 - 45)
        .attr('stroke', colorScale(idx)) // 범례 색상
        .attr('stroke-width', 2); // 범례 선 두께

      svg
        .append('text')
        .attr('x', width - 110)
        .attr('y', idx * 15 - 40)
        .attr('text-anchor', 'start')
        .style('fill', 'black') // 텍스트 색상
        .style('font-size', '14px') // 텍스트 크기
        .style('font-weight', 'bold') // 텍스트 두께
        .text(() => {
          if (!group.key) {
            return 'Unknown'; // Provide a fallback for invalid keys
          }
          return group.key.length > 10
            ? `${group.key.slice(0, 10)}...`
            : group.key;
        });
    });

    // X축 추가
    const tickInterval =
      dateTerm === 'week'
        ? d3.timeWeek.every(1)
        : dateTerm === 'month'
        ? d3.timeMonth.every(1)
        : d3.timeDay.every(1);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`) // X축 위치
      .call(
        d3
          .axisBottom(xScale)
          .ticks(tickInterval) // X축 틱 간격
          .tickFormat((d) => formatMonthDateToLocalISO(d)) // X축 레이블 포맷
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em') // X축 레이블 위치
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)'); // X축 레이블 회전

    // Y축 추가
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5)) // Y축 설정
      .append('text')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)') // 텍스트 회전
      .text(t('LineChart.Value')) // Y축 레이블
      .style('font-size', '16px');

    // 컴포넌트가 언마운트될 때 툴팁 제거
    return () => {
      tooltip.remove();
    };
  }, [data, groupedData, groupBy, t]);

  // 데이터가 없는 경우
  if (!groupedData || groupedData.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '20px' }}>
        {t('LineChart.NoDataFound')} {/* 데이터 없음 메시지 */}
      </div>
    );
  }

  // 차트 렌더링
  return <svg ref={svgRef} />;
};
export default LineChart;
