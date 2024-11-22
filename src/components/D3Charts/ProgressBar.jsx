import React, { useRef, useEffect } from 'react';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { scaleLinear } from 'd3-scale';

const ProgressBar = ({ data, barHeight = 20, barWidth = 200, gap = 0 }) => {
  const refs = useRef([]);

  // Determine the structure of `data`: if it’s a number, wrap it in an array for consistent handling
  const safeData =
    typeof data === 'number' ? [data] : Array.isArray(data) ? data : [];

  useEffect(() => {
    safeData.forEach((value, index) => {
      init(index);
      barTransition(value, index);
    });
  }, [safeData]);

  const init = (index) => {
    const node = refs.current[index];
    if (!node) return;

    // Clear any existing elements to avoid duplicates
    select(node).selectAll('*').remove();

    // Add a background rectangle to represent 100% width
    select(node)
      .append('rect')
      .attr('class', 'background-bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', barWidth) // Set to full width (100%)
      .attr('height', barHeight)
      .attr('fill', '#808080'); // Light gray color for the 100% background

    // Set up initial progress bar state
    select(node)
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 0)
      .attr('height', barHeight)
      .attr('fill', '#0000FF'); // Progress bar color

    // Add text label to show percentage
    select(node)
      .append('text')
      .attr('class', 'amount')
      .attr('x', 0)
      .attr('y', barHeight / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text('0%')
      .style('fill', '#FFFFFF'); // Text color
  };

  const barTransition = (value, index) => {
    const xScale = scaleLinear().domain([0, 100]).range([0, barWidth]);
    const t = transition().duration(800);

    // Transition the bar's width based on the data value
    select(refs.current[index])
      .select('.bar')
      .transition(t)
      .attr('width', xScale(value));

    // Update text label position and value
    select(refs.current[index])
      .select('.amount')
      .transition(t)
      .attr('x', Math.max(xScale(value) - 10, 0)) // Adjust text position inside the bar
      .text(`${value}%`);
  };

  return (
    <svg width={barWidth} height={(barHeight + gap) * safeData.length}>
      {safeData.map((_value, index) => (
        <g
          key={index}
          ref={(el) => (refs.current[index] = el)}
          className="progress-bar-group"
          transform={`translate(0, ${(barHeight + gap) * index})`}
        />
      ))}
    </svg>
  );
};

export default ProgressBar;
