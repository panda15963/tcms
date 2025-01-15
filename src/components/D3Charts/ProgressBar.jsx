import React, { useRef, useEffect } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';

/**
 * ProgressBar 컴포넌트 - 데이터 값을 기반으로 진행률 막대 생성
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {number|Array<number>} props.data - 진행률 값 (단일 값 또는 배열)
 * @param {number} [props.barHeight=20] - 막대 높이
 * @param {number} [props.barWidth=200] - 막대 너비
 * @param {number} [props.gap=0] - 막대 간 간격
 */
const ProgressBar = ({ data, barHeight = 20, barWidth = 200, gap = 0 }) => {
  const refs = useRef([]);

  // 데이터 형식 안전하게 처리: 숫자는 배열로 감싸고, 유효하지 않은 데이터는 빈 배열 처리
  const safeData =
    typeof data === 'number' ? [data] : Array.isArray(data) ? data : [];

  useEffect(() => {
    safeData.forEach((value, index) => {
      init(index); // 초기화
      barTransition(value, index); // 애니메이션 적용
    });
  }, [safeData]);

  /**
   * 진행률 막대 초기화
   * @param {number} index - 진행률 막대의 인덱스
   */
  const init = (index) => {
    const node = refs.current[index];
    if (!node) return;

    // 기존 요소 제거
    select(node).selectAll('*').remove();

    // 백그라운드 바 생성
    select(node)
      .append('rect')
      .attr('class', 'background-bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', barWidth)
      .attr('height', barHeight)
      .attr('fill', '#808080'); // 연한 회색 배경

    // 진행률 바 생성
    select(node)
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', 0)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 0)
      .attr('height', barHeight)
      .attr('fill', '#0000FF'); // 파란색 진행률 바

    // 텍스트 라벨 추가
    select(node)
      .append('text')
      .attr('class', 'amount')
      .attr('x', 0)
      .attr('y', barHeight / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text('0%')
      .style('fill', '#FFFFFF'); // 텍스트 색상
  };

  /**
   * 진행률 막대 애니메이션 적용
   * @param {number} value - 진행률 값 (0-100)
   * @param {number} index - 진행률 막대의 인덱스
   */
  const barTransition = (value, index) => {
    const xScale = scaleLinear().domain([0, 100]).range([0, barWidth]);

    // 막대 길이 애니메이션
    select(refs.current[index])
      .select('.bar')
      .attr('width', xScale(value));

    // 텍스트 위치 및 값 업데이트
    select(refs.current[index])
      .select('.amount')
      .attr('x', Math.max(xScale(value) - 10, 0)) // 막대 내부로 위치 조정
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