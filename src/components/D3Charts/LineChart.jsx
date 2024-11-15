import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data, type }) => {
  // State to hold values and dates for the chart
  const [values, setValues] = useState([]);
  const [dates, setDates] = useState([]);
  
  // Ref to access the SVG element for D3 manipulation
  const svgRef = useRef();
  
  // Define margins for the chart
  const margin = { top: 60, right: 20, bottom: 50, left: 70 };
  
  // Calculate width and height for the chart area (excluding margins)
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Legend position variables
  const legendX = width - 60; // Adjust for label position
  const legendY = -10; // Adjust for label position

  // Update values and dates when data changes
  useEffect(() => {
    setValues(data.map((d) => d.value));
    setDates(data.map((d) => d.date));
  }, [data]);

  // Main D3 chart rendering logic
  useEffect(() => {
    // If no data, return early
    if (values.length === 0 || dates.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG and apply transformations for margins
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define X scale as a time scale with padding on both sides
    const xScale = d3
      .scaleTime()
      .domain([
        d3.timeDay.offset(d3.extent(dates)[0], -10), // Offset to add padding
        d3.timeDay.offset(d3.extent(dates)[1], 10),
      ])
      .range([0, width]);

    // Define Y scale as a linear scale
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(values)]) // Domain from 0 to max value
      .range([height, 0]);

    // Define line generator function for the chart line
    const line = d3
      .line()
      .x((d, i) => xScale(dates[i]))
      .y((d, i) => yScale(values[i]))
      .curve(d3.curveMonotoneX); // Apply smooth curve

    // Draw the line on the chart
    svg
      .append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255, 99, 132, 1)')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Create tooltip for displaying data on hover
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('opacity', 0);

    // Add X axis with date labels
    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(d3.timeMonth) // Monthly ticks
          .tickFormat(d3.timeFormat('%Y-%m-%d'))
      )
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .text('Date')
      .style('font-size', '16px');

    // Add Y axis with value labels
    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5)) // Adjust tick number as needed
      .append('text')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text('Value')
      .style('font-size', '16px');

    // Add a title to the chart
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`${type} Line Chart`);

    // Add legend line and label
    svg
      .append('line')
      .attr('x1', legendX - 20)
      .attr('y1', legendY - 25) // Adjust vertically if needed
      .attr('x2', legendX + 10) // Line length
      .attr('y2', legendY - 25)
      .attr('stroke', 'rgba(255, 99, 132, 1)') // Match the line color
      .attr('stroke-width', 2);

    // Add legend label next to the line
    svg
      .append('text')
      .attr('x', legendX + 20) // Position text after the line
      .attr('y', legendY - 20)
      .attr('text-anchor', 'start')
      .style('fill', 'black') // Adjust color to match your preference
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(type); // Use the type prop to label the line
  }, [values, dates, width, height, type]);

  return <svg ref={svgRef} />;
};

export default LineChart;
