import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Preprocess data: Convert `date` to Date object and map count
    const processedData = data.map(d => ({
      date: new Date(d.date), // Convert date string to Date object
      count: d.count,
    }));

    const margin = { top: 10, right: 30, bottom: 90, left: 60 },
      width = 1200 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "white")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "lightgrey")
      .style("padding", "4px 8px")
      .style("border-radius", "4px")
      .style("visibility", "hidden")
      .style("font-size", "12px");

    // X-axis: Scale and axis
    const x = d3.scaleBand()
      .domain(processedData.map(d => d.date.toLocaleDateString())) // Format date for axis
      .range([0, width])
      .padding(0.2);

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    chart.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Date");

    // Y-axis: Scale and axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d.count)]) // Use `count` for Y-axis
      .nice()
      .range([height, 0]);

    chart.append("g").call(d3.axisLeft(y));

    chart.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text("Count");

    // Bars
    chart.selectAll("rect")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.date.toLocaleDateString()))
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2")
      .attr("y", y(0))
      .attr("height", 0)
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`Date: ${d.date.toLocaleDateString()} - Count: ${d.count}`);
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
      .delay((d, i) => i * 100);

  }, [data]);

  return <svg ref={svgRef} />;
};

export default BarChart;
