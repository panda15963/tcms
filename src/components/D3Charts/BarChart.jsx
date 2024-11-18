import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 90, left: 60 },
      width = 1200 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create main SVG element with white background
    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "white") // Set background color to white
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip element
    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "lightgrey")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("visibility", "hidden")
      .style("font-size", "12px");

    // X axis
    const x = d3.scaleBand()
      .domain(data.map(d => d.date.toLocaleDateString()))
      .range([0, width])
      .padding(0.2);

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // X axis label
    chart.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Date")

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height, 0]);

    chart.append("g").call(d3.axisLeft(y));

    // Y axis label
    chart.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text("Value")

    // Bars with animation and tooltip
    chart.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.date.toLocaleDateString()))
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2")
      .attr("y", y(0))
      .attr("height", 0)
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`Date: ${d.date.toLocaleDateString()} - Value: ${d.value}`);
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
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))
      .delay((d, i) => i * 100);

  }, [data]);

  return <svg ref={svgRef} />;
};

export default BarChart;
