import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

/**
 * 날짜를 ISO 로컬 형식으로 변환
 * @param {Date} date - 변환할 날짜 객체
 * @returns {string} 변환된 날짜 문자열 (YYYY-MM-DD 형식)
 */
const formatMonthDateToLocalISO = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
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
const LineChart = ({ data, groupBy, dateTerm }) => {
  const { t } = useTranslation(); // 다국어 번역 훅
  const svgRef = useRef(); // SVG 요소를 참조하는 ref

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
    if (!data || data.length === 0) return;

    /**
     * 데이터를 그룹화하여 차트에 표시할 형식으로 변환
     */

    const svg = d3.select(svgRef.current);
    const margin = { top: 60, right: 20, bottom: 50, left: 70 };
    const width = 1200 - margin.left - margin.right; // 차트 너비
    const height = 500 - margin.top - margin.bottom; // 차트 높이

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

    // SVG 초기화
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible');

    // X축 범위 설정 (전체 데이터의 날짜 범위)
    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(groupedData, (group) =>
          d3.min(group.data, (d) => new Date(d.date))
        ),
        d3.max(groupedData, (group) =>
          d3.max(group.data, (d) => new Date(d.date))
        ),
      ])
      .range([margin.left, width - margin.right]);

      const filteredDates =
      dateTerm === '주'
        ? groupedData.flatMap((group) => group.data.map((d) => new Date(d.date)))
        : dateTerm === '달'
        ? (() => {
            const startDate = new Date(
              xScale.domain()[0].getFullYear(),
              xScale.domain()[0].getMonth(),
              1
            );
            const endDate = new Date(
              xScale.domain()[1].getFullYear(),
              xScale.domain()[1].getMonth() + 1,
              1
            );
            const dates = [];
            let currentDate = new Date(startDate);
    
            while (currentDate <= endDate) {
              dates.push(new Date(currentDate));
              currentDate.setMonth(currentDate.getMonth() + 1);
            }
            return dates;
          })()
        : (() => {
            const startDate = xScale.domain()[0];
            const endDate = xScale.domain()[1];
            const dates = [];
            let currentDate = new Date(startDate);
    
            while (currentDate <= endDate) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
          })();
    

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(groupedData, (group) => d3.max(group.data, (d) => d.value)),
      ])
      .range([height - margin.bottom, margin.top]);

    groupedData.forEach((group, index) => {
      const sanitizedKey = (group.key || 'unknown').replace(
        /[^a-zA-Z0-9-_]/g,
        '_'
      );
      const color = d3.schemeCategory10[index % 10];

      const line = d3
        .line()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      svg
        .append('path')
        .datum(group.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      svg
        .selectAll(`.circle-${sanitizedKey}`)
        .data(group.data)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(new Date(d.date)))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 4)
        .attr('fill', color)
        .on('mouseover', (event, d) => {
          tooltip
            .style('opacity', 1) // 툴팁 표시
            .html(
              `<strong>${group.key}</strong><br>${t('LineChart.Date')}: ${
                d.date
              }<br>${t('LineChart.Value')}: ${d.value}`
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

      // 범례 색상 박스
      svg
        .append('line')
        .attr('x1', width - 150)
        .attr('y1', index * 15 - 45)
        .attr('x2', width - 120)
        .attr('y2', index * 15 - 45)
        .attr('stroke', color) // 범례 색상
        .attr('stroke-width', 2); // 범례 선 두께

      svg
        .append('text')
        .attr('x', width - 110)
        .attr('y', index * 15 - 40)
        .attr('text-anchor', 'start')
        .style('fill', 'black') // 텍스트 색상
        .style('font-size', '14px') // 텍스트 크기
        .style('font-weight', 'bold') // 텍스트 두께
        .text(() => {
          if (!group.key) {
            return 'Unknown';
          }
          return group.key.length > 10
            ? `${group.key.slice(0, 10)}...`
            : group.key;
        });
    });

    // X 축
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(filteredDates) // 모든 날짜를 tick 값으로 설정
          .tickFormat((d) => formatMonthDateToLocalISO(d)) // X축 레이블 포맷
      )
      .attr('font-size', '12px')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em') // X축 레이블 위치
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)'); // X축 레이블 회전

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text(t('LineChart.Date')); // X축 라벨

    // Y 축
    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .attr('font-size', '12px');

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .text(t('LineChart.Value')); // Y축 라벨
  }, [data, groupBy, dateTerm]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
