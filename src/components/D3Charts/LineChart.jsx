import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

const formatMonthDateToLocalISO = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LineChart = ({ data, groupBy }) => {
  const { t } = useTranslation();
  const svgRef = useRef();

  const margin = { top: 60, right: 20, bottom: 50, left: 70 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Preprocess data based on groupBy
  const groupedData = Array.from(
    d3.group(data, (d) => d[groupBy]),
    ([group, entries]) => ({
      type: group,
      data: entries.map((entry) => {
        const isMonthFormat = entry.date.length === 7; // Check if it's 'YYYY-MM'
        return {
          date: isMonthFormat
            ? entry.date
            : formatMonthDateToLocalISO(new Date(entry.date)),
          value: entry.count,
        };
      }),
    })
  );

  useEffect(() => {
    const dateTerm =
      data.length > 0 && data[0].dateTerm ? data[0].dateTerm : 'day';

    if (!groupedData || groupedData.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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
      .style('opacity', 0);

    const allDates = groupedData.flatMap((group) =>
      group.data.map((d) => new Date(d.date))
    );
    const allValues = groupedData.flatMap((group) =>
      group.data.map((d) => d.value)
    );

    const xScale = d3.scaleTime().domain(d3.extent(allDates)).range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allValues)])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    groupedData.forEach((group, idx) => {
      if (group.data.length > 1) {
        svg
          .append('path')
          .datum(group.data)
          .attr('fill', 'none')
          .attr('stroke', colorScale(idx)) // Use idx here
          .attr('stroke-width', 2)
          .attr('d', line);
      }

      group.data.forEach((point) => {
        svg
          .append('circle')
          .attr('cx', xScale(new Date(point.date)))
          .attr('cy', yScale(point.value))
          .attr('r', 5)
          .attr('fill', colorScale(idx)) // Use idx here
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .on('mouseover', (event) => {
            tooltip
              .style('opacity', 1)
              .html(
                `<strong>${group.type}</strong><br>${t('LineChart.Date')}: ${point.date}<br>${t('LineChart.Value')}: ${point.value}`
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

      // Add legend for each group
      svg
        .append('line')
        .attr('x1', width - 150)
        .attr('y1', idx * 15 - 45)
        .attr('x2', width - 120)
        .attr('y2', idx * 15 - 45)
        .attr('stroke', colorScale(idx))
        .attr('stroke-width', 2);

      svg
        .append('text')
        .attr('x', width - 110)
        .attr('y', idx * 15 - 40)
        .attr('text-anchor', 'start')
        .style('fill', 'black')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(group.type);
    });

    // X-Axis with custom tick interval and ISO format
    const tickInterval =
      dateTerm === 'week'
        ? d3.timeWeek.every(1)
        : dateTerm === 'month'
        ? d3.timeMonth.every(1)
        : d3.timeDay.every(1);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(tickInterval)
          .tickFormat((d) => formatMonthDateToLocalISO(d))
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)');

    svg
      .append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .append('text')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('fill', 'black')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .text(t('LineChart.Value'))
      .style('font-size', '16px');

    return () => {
      tooltip.remove();
    };
  }, [data, groupedData]);

  if (!groupedData || groupedData.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '20px' }}>
        {t('LineChart.NoDataFound')}
      </div>
    );
  }

  return <svg ref={svgRef} />;
};

export default LineChart;
