import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

const BarChart = ({ data }) => {
  const { t } = useTranslation(); // 다국어 번역 훅
  const chartRef = useRef();

  useEffect(() => {
    // 기존 차트를 제거하여 중복 생성 방지
    d3.select(chartRef.current).select('svg').remove();

    // 차트 크기 설정
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // 데이터를 날짜별로 그룹화
    const groupedData = d3.group(data, (d) => d.date);

    // funcname의 고유 값 가져오기
    const funcnames = Array.from(new Set(data.map((d) => d.funcname)));

    // 색상 스케일 설정
    const colorScale = d3
      .scaleOrdinal()
      .domain(funcnames)
      .range(d3.schemeTableau10);

    // SVG 요소 생성
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X축 스케일 설정
    const x0 = d3
      .scaleBand()
      .domain(Array.from(groupedData.keys())) // 그룹화된 데이터의 키(날짜) 설정
      .range([0, width])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(funcnames) // funcname별로 세부 스케일 설정
      .range([0, x0.bandwidth()])
      .padding(0.1);

    // Y축 스케일 설정
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)]) // count 값의 최대값 설정
      .nice()
      .range([height, 0]);

    // X축 그리기
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('transform', 'rotate(-45)') // 텍스트 기울이기
      .style('text-anchor', 'end');

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .text(t('BarChart.Date')); // X축 라벨

    // Y축 그리기
    svg.append('g').call(d3.axisLeft(y));

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 20)
      .text(t('BarChart.Value')); // Y축 라벨

    // 바 생성
    svg
      .append('g')
      .selectAll('g')
      .data(groupedData)
      .join('g')
      .attr('transform', (d) => `translate(${x0(d[0])},0)`) // 날짜별 위치 지정
      .selectAll('rect')
      .data((d) => d[1]) // 날짜별 데이터 바인딩
      .join('rect')
      .attr('x', (d) => x1(d.funcname)) // funcname별 위치 지정
      .attr('y', (d) => y(d.count)) // 바의 Y축 위치
      .attr('width', x1.bandwidth()) // 바의 너비
      .attr('height', (d) => height - y(d.count)) // 바의 높이
      .attr('fill', (d) => colorScale(d.funcname)); // 색상 적용
  }, [data]);

  return <div ref={chartRef} />;
};

export default BarChart;
