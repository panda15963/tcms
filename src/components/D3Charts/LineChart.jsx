import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data }) => {
  const svgRef = useRef();

  const margin = { top: 60, right: 20, bottom: 50, left: 70 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || data.length === 0) {
      // Clear SVG content if no data
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Flatten all dates and values to determine global x and y scales
    const allDates = data.flatMap((tool) =>
      tool.data.map((d) => new Date(d.date))
    );
    const allValues = data.flatMap((tool) => tool.data.map((d) => d.value));

    // Scales
    const xScale = d3.scaleTime().domain(d3.extent(allDates)).range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allValues)])
      .range([height, 0]);

    // Line generator
    const line = d3
      .line()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Colors for multiple lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Plot each tool's data
    data.forEach((tool, index) => {
      if (tool.data.length === 1) {
        // If only one data point, draw a circle
        svg
          .append('circle')
          .attr('cx', xScale(new Date(tool.data[0].date)))
          .attr('cy', yScale(tool.data[0].value))
          .attr('r', 5) // Circle radius
          .attr('fill', colorScale(index))
          .attr('stroke', 'black') // Optional stroke for better visibility
          .attr('stroke-width', 1);
      } else {
        // Draw a line for multiple data points
        svg
          .append('path')
          .datum(tool.data)
          .attr('fill', 'none')
          .attr('stroke', colorScale(index))
          .attr('stroke-width', 2)
          .attr('d', line);
      }

      // Add legend line
      svg
        .append('line')
        .attr('x1', width - 150)
        .attr('y1', index * 15 - 30)
        .attr('x2', width - 120)
        .attr('y2', index * 15 - 30)
        .attr('stroke', colorScale(index))
        .attr('stroke-width', 2);

      // Add legend text
      svg
        .append('text')
        .attr('x', width - 110)
        .attr('y', index * 15 - 30)
        .attr('text-anchor', 'start')
        .style('fill', 'black')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(tool.type);
    });

    // X-axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(d3.timeMonth)
          .tickFormat(d3.timeFormat('%Y-%m-%d'))
      )
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Date')
      .style('font-size', '16px');

    // Y-axis
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .append('text')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Value')
      .style('font-size', '16px');
  }, [data]);

  // Render message if no data
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '18px' }}>
        검색 결과가 없습니다.
      </div>
    );
  }

  return <svg ref={svgRef} />;
};

export default LineChart;
