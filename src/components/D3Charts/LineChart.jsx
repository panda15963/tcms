import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';

/**
 * 날짜를 ISO 형식으로 변환
 * @param {Date} date - 날짜
 * @returns {string} ISO 형식의 날짜
 */
const formatMonthDateToLocalISO = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * BarChart 컴포넌트 - 데이터 값을 기반으로 진행률 막대 생성
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {Array<object>} props.data - 진행률 값 (객체 배열)
 * @param {string} props.groupBy - 그룹화 기준 (tools 또는 toolver)
 * @param {string} props.dateTerm - 날짜 단위 (일, 주, 달, Month)
 * @returns {JSX.Element} BarChart 컴포넌트
 */
const LineChart = ({ data, groupBy, dateTerm, windowSize }) => {
  const { t } = useTranslation();
  const svgRef = useRef();
  const groupKey = groupBy === 'tools' ? 'toolname' : 'toolver';

  const groupedData = data
    ? Array.from(
        d3.group(data, (d) => d[groupKey]),
        ([key, entries]) => {
          const processedData =
            dateTerm === '달' || dateTerm === 'Month'
              ? Array.from(
                  d3.group(entries, (d) => {
                    const date = new Date(d.date);
                    return `${date.getFullYear()}-${String(
                      date.getMonth() + 1
                    ).padStart(2, '0')}`;
                  }),
                  ([month, groupedEntries]) => ({
                    date: `${month}-01`,
                    value: d3.sum(groupedEntries, (entry) => entry.count),
                  })
                )
              : dateTerm === '년' || dateTerm === 'Year'
              ? Array.from(
                  d3.group(entries, (d) => {
                    const date = new Date(d.date);
                    return `${date.getFullYear()}`;
                  }),
                  ([year, groupedEntries]) => ({
                    date: `${year}`,
                    value: d3.sum(groupedEntries, (entry) => entry.count),
                  })
                )
              : entries.map((entry) => ({
                  date: formatMonthDateToLocalISO(new Date(entry.date)),
                  value: entry.count,
                }));

          return { key, data: processedData };
        }
      )
    : [];

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 60, right: 0, bottom: 50, left: 0 };
    const width = windowSize.width * 0.8 - margin.left - margin.right;
    const height = windowSize.height * 0.6 - margin.top - margin.bottom;

    svg
      .attr(
        'viewBox',
        `0 0 ${width + margin.left + margin.right} ${
          height + margin.top + margin.bottom
        }`
      )
      .attr('preserveAspectRatio', 'xMidYMid meet');

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

    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible');

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(groupedData, (group) =>
          d3.min(group.data, (d) => new Date(d.date))
        ),
        d3.max(groupedData, (group) =>
          d3.max(group.data, (d) => new Date(d.date))
        ),
      ])
      .range([margin.left, width - margin.right]);

    const filteredDates = (() => {
      switch (dateTerm) {
        case '주': {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];
          const weeks = [];
          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            const firstDayOfMonth = new Date(year, month - 1, 1);
            const weekNumber = Math.ceil(
              (currentDate.getDate() + firstDayOfMonth.getDay()) / 7
            );

            weeks.push({
              label: `${year}년 ${month}월 ${weekNumber}주차`,
              date: new Date(currentDate),
            });

            currentDate.setDate(currentDate.getDate() + 7);
          }

          return weeks;
        }
        case 'Week': {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];
          const weeks = [];
          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.toLocaleString('en-US', {
              month: 'short',
            });
            const weekNumber = Math.ceil(currentDate.getDate() / 7);

            const getOrdinalSuffix = (num) => {
              const j = num % 10;
              const k = num % 100;
              if (j === 1 && k !== 11) return `${num}st`;
              if (j === 2 && k !== 12) return `${num}nd`;
              if (j === 3 && k !== 13) return `${num}rd`;
              return `${num}th`;
            };

            const weekLabel = `${month} ${getOrdinalSuffix(
              weekNumber
            )} W, ${year}`;

            weeks.push({
              label: weekLabel,
              date: new Date(currentDate),
            });

            currentDate.setDate(currentDate.getDate() + 7);
          }
          return weeks;
        }

        case '달': {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];
          const dates = [];
          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            if (currentDate.getDate() === 1) {
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');

              dates.push({
                label: `${year}년 ${month}월`,
                date: new Date(currentDate),
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return dates;
        }

        case 'Month': {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];
          const dates = [];
          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            if (currentDate.getDate() === 1) {
              const year = currentDate.getFullYear();
              const month = currentDate.toLocaleString('en-US', {
                month: 'long',
              });

              dates.push({
                label: `${month}, ${year}`,
                date: new Date(currentDate),
              });
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return dates;
        }
        case '년': {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];

          // 유효한 날짜 확인
          if (!startDate || !endDate) {
            return [];
          }

          const years = [];
          let currentDate = new Date(startDate);

          while (currentDate.getFullYear() <= endDate.getFullYear()) {
            years.push({
              label: `${currentDate.getFullYear()}년`,
              date: new Date(currentDate.getFullYear(), 0, 1), // 매년 1월 1일
            });

            currentDate.setFullYear(currentDate.getFullYear() + 1);
          }

          return years;
        }

        case 'Year': {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];

          // 유효한 날짜 확인
          if (!startDate || !endDate) {
            return [];
          }

          const years = [];
          let currentDate = new Date(startDate);

          while (currentDate.getFullYear() <= endDate.getFullYear()) {
            years.push({
              label: `${currentDate.getFullYear()}`,
              date: new Date(currentDate.getFullYear(), 0, 1), // 매년 1월 1일
            });

            currentDate.setFullYear(currentDate.getFullYear() + 1);
          }

          return years;
        }

        default: {
          const startDate = xScale.domain()[0];
          const endDate = xScale.domain()[1];
          const allDates = [];
          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
          return allDates;
        }
      }
    })();

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(groupedData, (group) => d3.max(group.data, (d) => d.value)),
      ])
      .range([height - margin.bottom, margin.top]);

    groupedData.forEach((group, index) => {
      const sanitizedKey = (group.key || 'unknown').replace(
        /[^a-zA-Z0-9-_]/g,
        '_'
      );
      const color = d3.schemeCategory10[index % 10];

      const line = d3
        .line()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      svg
        .append('path')
        .datum(group.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      svg
        .selectAll(`.circle-${sanitizedKey}`)
        .data(group.data)
        .enter()
        .append('circle')
        .attr('cx', (d) => xScale(new Date(d.date)))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 4)
        .attr('fill', color)
        .on('mouseover', (_, d) => {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${group.key}</strong><br>${t('LineChart.Date')}: ${
                d.date
              }<br>${t('LineChart.Value')}: ${d.value}`
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

      svg
        .append('line')
        .attr('x1', width - 230)
        .attr('y1', index * 15 + 20)
        .attr('x2', width - 190)
        .attr('y2', index * 15 + 20)
        .attr('stroke', color)
        .attr('stroke-width', 2);

      svg
        .append('text')
        .attr('x', width - 180)
        .attr('y', index * 15 + 20)
        .attr('text-anchor', 'start')
        .style('fill', 'black')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(() => {
          if (!group.key) {
            return 'Unknown';
          }
          return group.key;
        });
    });

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(filteredDates.map((d) => d.date || d))
          .tickFormat((d, i) =>
            dateTerm === '달' || dateTerm === 'Month'
              ? filteredDates[i].label // Use the formatted "YYYY년 MM월"
              : dateTerm === '주' || dateTerm === 'Week'
              ? filteredDates[i].label // Use "YYYY년 MM월 nth째주" for weeks
              : dateTerm === '년' || dateTerm === 'Year'
              ? filteredDates[i].label // Use "YYYY년" for years
              : formatMonthDateToLocalISO(d)
          )
      )
      .attr('font-size', '12px')
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-45)');

    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom + 10)
      .text(t('LineChart.Date'));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .attr('font-size', '12px');

    svg
      .append('text')
      .attr('text-anchor', 'middle') // 중앙 정렬
      .attr('x', -margin.left - 60) // 더 왼쪽으로 이동 (숫자 조정 가능)
      .attr('y', height / 2) // Y축 중간에 배치
      .style('font-size', '14px')
      .text(t('LineChart.Value'));

    if (dateTerm === 'Week') {
      const noticeGroup = svg
        .append('g')
        .attr('transform', `translate(0, -80)`);

      // 공지사항 배경 및 테두리
      const noticeWidth = 400;
      const noticeHeight = 30;
      const noticeX = (width - noticeWidth) / 2; // 중앙 정렬
      const noticeY = 50;

      noticeGroup
        .append('rect')
        .attr('x', noticeX)
        .attr('y', noticeY)
        .attr('width', noticeWidth)
        .attr('height', noticeHeight)
        .attr('rx', 10) // 둥근 모서리
        .attr('ry', 10)
        .style('fill', '#f9f9f9') // 배경색
        .style('stroke', '#000000') // 테두리 색상
        .style('stroke-width', 1.5); // 테두리 두께

      // 공지사항 텍스트
      noticeGroup
        .append('text')
        .attr('x', width / 2) // 중앙 정렬
        .attr('y', noticeY + noticeHeight / 2 + 5) // 텍스트 세로 정렬
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#000000')
        .text(t('LineChart.Notification')); // 공지사항 텍스트
    }
  }, [data, groupBy, dateTerm, windowSize]);

  return <svg ref={svgRef} className="w-11/12 h-full px-2" />;
};

export default LineChart;
