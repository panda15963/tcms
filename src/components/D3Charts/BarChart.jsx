import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

/**
 * BarChart 컴포넌트 - 데이터를 시각화하여 막대 그래프로 표시
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {Array} props.data - 그래프에 표시할 데이터 배열 (date, count 포함)
 */
const BarChart = ({ data }) => {
  const { t } = useTranslation(); // 다국어 번역 훅
  const svgRef = useRef(); // SVG 요소 참조

  useEffect(() => {
    // 데이터 전처리: `date`를 Date 객체로 변환
    const processedData = data.map(d => ({
      date: new Date(d.date), // 날짜 문자열을 Date 객체로 변환
      count: d.count,
    }));

    const margin = { top: 10, right: 30, bottom: 90, left: 60 },
      width = 1200 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 이전 내용 제거

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "white")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 툴팁 생성
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "lightgrey")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("visibility", "hidden")
      .style("font-size", "12px");

    // X축 설정
    const x = d3.scaleBand()
      .domain(processedData.map(d => d.date.toLocaleDateString())) // 날짜 포맷
      .range([0, width])
      .padding(0.2);

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)") // 텍스트 회전
      .style("text-anchor", "end");

    chart.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text(t('BarChart.Date')); // X축 라벨

    // Y축 설정
    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.count)]) // Y축 최대값 설정
      .nice()
      .range([height, 0]);

    chart.append("g").call(d3.axisLeft(y));

    chart.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text(t('BarChart.Value')); // Y축 라벨

    // 막대 추가
    chart.selectAll("rect")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.date.toLocaleDateString()))
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2")
      .attr("y", y(0))
      .attr("height", 0)
      .on("mouseover", (_event, d) => {
        tooltip.style("visibility", "visible")
          .text(`${t('BarChart.Date')}: ${d.date.toLocaleDateString()} - ${t('BarChart.Value')}: ${d.count}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(800)
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))
      .delay((d, i) => i * 100); // 각 막대에 지연 효과 추가

  }, [data, t]);

  return <svg ref={svgRef} />;
};
export default BarChart;