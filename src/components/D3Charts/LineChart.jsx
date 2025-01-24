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
    const margin = { top: 20, right: 250, bottom: 130, left: 100 };
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
      .range([margin.left - 50, width - margin.right + 400]);

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

          const getOrdinalSuffix = (day) => {
            if (day > 3 && day < 21) return `${day}th`;
            switch (day % 10) {
              case 1:
                return `${day}st`;
              case 2:
                return `${day}nd`;
              case 3:
                return `${day}rd`;
              default:
                return `${day}th`;
            }
          };

          while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.toLocaleString('en-US', {
              month: 'long',
            });
            const day = currentDate.getDate();

            if (dateTerm === '일') {
              allDates.push({
                label: `${year}년 ${String(currentDate.getMonth() + 1).padStart(
                  2,
                  '0'
                )}월 ${String(day).padStart(2, '0')}일`,
                date: new Date(currentDate),
              });
            } else {
              allDates.push({
                label: `${month} ${getOrdinalSuffix(day)}, ${year}`,
                date: new Date(currentDate),
              });
            }
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
      .range([height - margin.bottom + 200, margin.top]);

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

      const legend = svg
        .append('g')
        .attr('transform', `translate(${width}, 0)`)
        .style('cursor', 'default'); // 마우스 이벤트 방지

      const funcnames = groupedData.map((group) => group.key || 'unknown');
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(funcnames);

      const itemsPerPage = 21;
      let currentPage = 0;

      const renderLegend = (page) => {
        legend.selectAll('*').remove(); // 이전 범례를 제거
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const visibleFuncnames = funcnames.slice(start, end);

        // 범례 배경 사각형
        legend
          .append('rect')
          .attr('x', 170)
          .attr('y', -10)
          .attr('width', 250)
          .attr('height', itemsPerPage * 25 + 50) // 아래에 페이지네이션 버튼 공간 추가
          .attr('fill', '#f9f9f9') // 배경색
          .attr('stroke', '#ccc') // 테두리 색상
          .attr('stroke-width', 1)
          .attr('rx', 10) // 모서리를 둥글게
          .attr('ry', 10); // 모서리를 둥글게

        // 툴팁 요소 생성
        const legendTooltip = d3
          .select('body')
          .append('div')
          .style('position', 'absolute')
          .style('background', '#fff')
          .style('border', '1px solid #ccc')
          .style('color', '#000')
          .style('padding', '5px 10px')
          .style('border-radius', '5px')
          .style('font-size', '15px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        // 각 funcname에 대한 범례 항목 생성
        visibleFuncnames.forEach((funcname, i) => {
          const legendRow = legend
            .append('g')
            .attr('transform', `translate(40, ${i * 25})`)
            .on('mouseover', (event) => {
              const tooltipWidth = legendTooltip.node().offsetWidth; // 툴팁 너비 확인
              const leftPosition = event.pageX - tooltipWidth - 10; // 왼쪽으로 이동
              const topPosition = event.pageY - 20; // Y 위치 유지

              legendTooltip
                .style('opacity', 1)
                .html(`<strong>${funcname}</strong>`)
                .style('left', `${leftPosition}px`)
                .style('top', `${topPosition}px`);
            })
            .on('mousemove', (event) => {
              const tooltipWidth = legendTooltip.node().offsetWidth;
              const leftPosition = event.pageX - tooltipWidth - 10; // 왼쪽으로 이동
              const topPosition = event.pageY - 20; // Y 위치 유지

              legendTooltip
                .style('left', `${leftPosition}px`)
                .style('top', `${topPosition}px`);
            })
            .on('mouseout', () => {
              legendTooltip.style('opacity', 0);
            });

          legendRow
            .append('rect')
            .attr('x', 150)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', colorScale(funcname)); // 색상

          legendRow
            .append('text')
            .attr('x', 180)
            .attr('y', 15)
            .style('text-anchor', 'start')
            .text(
              funcname.length > 20
                ? funcname.substring(0, 20) + '...'
                : funcname
            );
        });

        // 페이지네이션 버튼 생성
        const paginationGroup = legend
          .append('g')
          .attr('transform', `translate(0, ${itemsPerPage * 25})`);

        // 이전 버튼
        paginationGroup
          .append('text')
          .attr('x', 180)
          .attr('y', 25)
          .style('cursor', 'default')
          .style('fill', currentPage > 0 ? '#007BFF' : '#ccc') // 첫 페이지는 비활성화
          .text(`< ${t('BarChart.PreviousButton')}`)
          .on('click', () => {
            if (currentPage > 0) {
              currentPage--;
              renderLegend(currentPage); // 이전 페이지 렌더링
            }
          });

        paginationGroup
          .append('text')
          .attr('x', 280)
          .attr('y', 25)
          .text(
            `${currentPage + 1} / ${Math.ceil(funcnames.length / itemsPerPage)}`
          );

        // 다음 버튼
        paginationGroup
          .append('text')
          .attr('x', 360)
          .attr('y', 25)
          .style('cursor', 'default')
          .style(
            'fill',
            (currentPage + 1) * itemsPerPage < funcnames.length
              ? '#007BFF'
              : '#ccc'
          ) // 마지막 페이지는 비활성화
          .text(`${t('BarChart.NextButton')} >`)
          .on('click', () => {
            if ((currentPage + 1) * itemsPerPage < funcnames.length) {
              currentPage++;
              renderLegend(currentPage); // 다음 페이지 렌더링
            }
          });
      };

      renderLegend(currentPage);
    });

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom + 200})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(filteredDates.map((d) => d.date || d))
          .tickFormat(
            (d, i) =>
              dateTerm === '달' || dateTerm === 'Month'
                ? filteredDates[i].label // Use the formatted "YYYY년 MM월"
                : dateTerm === '주' || dateTerm === 'Week'
                ? filteredDates[i].label // Use "YYYY년 MM월 nth째주" for weeks
                : dateTerm === '년' || dateTerm === 'Year'
                ? filteredDates[i].label // Use "YYYY년" for years
                : filteredDates[i].label // Use the formatted "YYYY년 MM월 DD일"
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
      .attr('x', (width + margin.left - margin.right) / 2 + 170)
      .attr('y', height + margin.bottom + 50)
      .style('font-size', '15px')
      .text(t('LineChart.Date'));

    svg
      .append('g')
      .attr('transform', `translate(${margin.left - 50}, 0)`)
      .call(d3.axisLeft(yScale))
      .attr('font-size', '12px');

    svg
      .append('text')
      .attr('text-anchor', 'middle') // 중앙 정렬
      .attr('transform', `translate(${margin.left - 120}, ${height / 2 + 30})`)
      .style('font-size', '15px')
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
