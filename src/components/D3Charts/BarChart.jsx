import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

const BarChart = ({ data, dateTerm }) => {
  const { t } = useTranslation(); // 다국어 번역 훅
  const chartRef = useRef(); // 차트를 렌더링할 DOM 요소 참조

  useEffect(() => {
    // 기존 차트를 제거하여 중복 생성 방지
    d3.select(chartRef.current).select('svg').remove();

    // 차트 크기 설정
    const margin = { top: 50, right: 150, bottom: 100, left: 60 }; // 오른쪽 여백을 확장하여 범례 배치
    const width = 1200 - margin.left - margin.right; // 차트 너비
    const height = 500 - margin.top - margin.bottom; // 차트 높이

    // dateTerm이 "달"이면 날짜를 1일로 변경
    const transformedData =
      dateTerm === '달' || dateTerm === 'Month'
        ? data.map((d) => {
            const dateObj = new Date(d.date);
            return {
              ...d,
              date: `${dateObj.getFullYear()}년 ${String(
                dateObj.getMonth() + 1
              ).padStart(2, '0')}월`, // "YYYY년 MM월" 형식으로 변경
            };
          })
        : data;

    // 데이터를 날짜별로 그룹화
    const groupedData = d3.group(transformedData, (d) =>
      dateTerm === '주' || dateTerm === 'Week'
        ? `${new Date(d.date).getFullYear()}년 ${
            new Date(d.date).getMonth() + 1
          }월 ${Math.ceil(
            (new Date(d.date).getDate() + new Date(d.date).getDay()) / 7
          )}째주`
        : d.date
    );

    const xLabels = Array.from(groupedData.keys());

    // funcname(함수 이름)의 고유 값 가져오기
    const funcnames = Array.from(
      new Set(transformedData.map((d) => d.funcname).filter(Boolean)) // null/undefined 값 제거
    );

    // 날짜별 funcname 매핑
    const dateFuncnames = new Map(
      Array.from(groupedData, ([date, entries]) => [
        date,
        Array.from(new Set(entries.map((d) => d.funcname))),
      ])
    );

    // funcname에 따른 색상 설정
    const colorScale = d3
      .scaleOrdinal()
      .domain(Array.from(dateFuncnames.values()).flat())
      .range(d3.schemeTableau10); // D3의 색상 팔레트 사용

    // SVG 요소 생성
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right) // 전체 너비
      .attr('height', height + margin.top + margin.bottom) // 전체 높이
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`); // 차트 내부 여백 설정

    // X축 스케일 설정 (날짜)
    const x0 = d3
      .scaleBand()
      // .domain(Array.from(groupedData.keys())) // 그룹화된 데이터의 키(날짜) 설정
      .domain(xLabels)
      .range([0, width])
      .padding(0.2); // X축 간격

    // Y축 스케일 설정 (값)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(transformedData, (d) => d.count)])
      .nice() // 라운드 처리
      .range([height, 0]);

    // X축 그리기
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`) // X축 위치
      .call(d3.axisBottom(x0)) // X축 표시
      .selectAll('text')
      .attr('transform', 'rotate(-45)') // 텍스트 기울이기
      .style('text-anchor', 'end'); // 텍스트 정렬 설정

    svg
      .append('text') // X축 라벨
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text(t('BarChart.Date')); // 다국어 번역 텍스트

    // Y축 그리기
    svg.append('g').call(d3.axisLeft(y)); // Y축 표시

    svg
      .append('text') // Y축 라벨
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)') // 회전하여 세로 방향으로 배치
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .text(t('BarChart.Value')); // 다국어 번역 텍스트

    // 툴팁 생성
    const tooltip = d3
      .select(chartRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('opacity', 0); // 초기 투명도 설정

    // 바 생성
    Array.from(groupedData).forEach(([date, entries]) => {
      // 날짜별 funcname 가져오기
      const funcnamesForDate = dateFuncnames.get(date);

      // X1 스케일 설정 (funcname 간 간격)
      const x1 = d3
        .scaleBand()
        .domain(funcnamesForDate)
        .range([0, x0.bandwidth()])
        .padding(0.1);

      // 날짜 그룹 생성
      const dateGroup = svg
        .append('g')
        .attr('transform', `translate(${x0(date)}, 0)`);

      // 바 생성
      dateGroup
        .selectAll('rect')
        .data(entries)
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.funcname)) // funcname 위치
        .attr('y', (d) => y(d.count)) // 높이에 따른 위치
        .attr('width', x1.bandwidth()) // 바 너비
        .attr('height', (d) => height - y(d.count)) // 데이터 값에 따른 바 높이
        .attr('fill', (d) => colorScale(d.funcname)) // 색상 설정
        .on('mouseover', (_, d) => {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${d.funcname}</strong><br>${t('BarChart.Date')}: ${
                d.date
              }<br>${t('BarChart.Value')}: ${d.count}`
            );
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 30 + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    });

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width}, 0)`)
      .style('cursor', 'default'); // 마우스 이벤트 방지

    const itemsPerPage = 10;
    let currentPage = 0;

    const renderLegend = (page) => {
      legend.selectAll('*').remove(); // 이전 범례를 제거
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const visibleFuncnames = funcnames.slice(start, end);

      // 범례 배경 사각형
      legend
        .append('rect')
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', 150)
        .attr('height', itemsPerPage * 25 + 50) // 아래에 페이지네이션 버튼 공간 추가
        .attr('fill', '#f9f9f9') // 배경색
        .attr('stroke', '#ccc') // 테두리 색상
        .attr('stroke-width', 1);

      // 각 funcname에 대한 범례 항목 생성
      visibleFuncnames.forEach((funcname, i) => {
        const legendRow = legend
          .append('g')
          .attr('transform', `translate(0, ${i * 25})`);

        legendRow
          .append('rect')
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', colorScale(funcname)); // 색상

        legendRow
          .append('text')
          .attr('x', 30)
          .attr('y', 15)
          .style('text-anchor', 'start')
          .text(
            funcname.length > 10 ? `${funcname.slice(0, 10)}...` : funcname
          );
      });

      // 페이지네이션 버튼 생성
      const paginationGroup = legend
        .append('g')
        .attr('transform', `translate(0, ${itemsPerPage * 25})`);

      // 이전 버튼
      paginationGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 25)
        .style('cursor', 'default')
        .style('fill', currentPage > 0 ? '#007BFF' : '#ccc') // 첫 페이지는 비활성화
        .text(`< ${t('BarChart.PreviousButton')}`)
        .on('click', () => {
          if (currentPage > 0) {
            currentPage--;
            renderLegend(currentPage); // 이전 페이지 렌더링
          }
        });

      // 다음 버튼
      paginationGroup
        .append('text')
        .attr('x', 80)
        .attr('y', 25)
        .style('cursor', 'default')
        .style(
          'fill',
          (currentPage + 1) * itemsPerPage < funcnames.length
            ? '#007BFF'
            : '#ccc'
        ) // 마지막 페이지는 비활성화
        .text(`${t('BarChart.NextButton')} >`)
        .on('click', () => {
          if ((currentPage + 1) * itemsPerPage < funcnames.length) {
            currentPage++;
            renderLegend(currentPage); // 다음 페이지 렌더링
          }
        });
    };

    renderLegend(currentPage);

    d3.select(chartRef.current).on('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY;

      if (delta > 0 && (currentPage + 1) * itemsPerPage < funcnames.length) {
        currentPage++;
      } else if (delta < 0 && currentPage > 0) {
        currentPage--;
      }

      renderLegend(currentPage);
    });
  }, [data, t]); // 종속성 배열에 data와 t 추가

  return <div ref={chartRef} />; // 차트를 렌더링할 DOM 요소
};

export default BarChart;
