import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as d3 from 'd3';
/**
 * BarChart 컴포넌트 - 데이터 값을 기반으로 진행률 막대 생성
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {Array<object>} props.data - 차트 데이터
 * @param {string} props.dateTerm - 날짜 단위
 * @returns {JSX.Element} BarChart 컴포넌트
 */
const BarChart = ({ data, dateTerm }) => {
  const { t } = useTranslation(); // 다국어 번역 훅
  const chartRef = useRef(); // 차트를 렌더링할 DOM 요소 참조

  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  useEffect(() => {
    // 기존 차트를 제거하여 중복 생성 방지
    d3.select(chartRef.current).select('svg').remove();

    // 차트 크기 설정
    const margin = { top: 50, right: 250, bottom: 100, left: 100 }; // 오른쪽 여백을 확장하여 범례 배치
    const width =
      chartRef.current.parentNode.clientWidth - margin.left - margin.right;
    const height =
      chartRef.current.parentNode.clientHeight - margin.top - margin.bottom;

    // 데이터 변환
    let transformedData;
    switch (dateTerm) {
      case '달': {
        transformedData = data.map((d) => {
          const dateObj = new Date(d.date);
          return {
            ...d,
            date: `${dateObj.getFullYear()}년 ${String(
              dateObj.getMonth() + 1
            ).padStart(2, '0')}월`,
          };
        });
        break;
      }

      case 'Month': {
        // 데이터 범위를 추출 (데이터가 날짜순으로 정렬되었다고 가정)
        const xScale = d3.scaleTime().domain([
          new Date(d3.min(data, (d) => new Date(d.date))), // 데이터 중 가장 이른 날짜
          new Date(d3.max(data, (d) => new Date(d.date))), // 데이터 중 가장 늦은 날짜
        ]);

        // 월별 라벨 생성
        const startDate = xScale.domain()[0]; // 범위 시작 날짜
        const endDate = xScale.domain()[1]; // 범위 끝 날짜
        const dates = []; // 월별 라벨을 저장할 배열
        let currentDate = new Date(startDate); // 현재 날짜를 시작 날짜로 초기화

        // 끝 날짜를 포함하여 라벨 생성
        while (currentDate <= endDate) {
          const year = currentDate.getFullYear(); // 현재 날짜의 연도
          const month = currentDate.toLocaleString('en-US', { month: 'long' }); // 현재 날짜의 월 이름
          dates.push({
            label: `${month}, ${year}`, // "월, 연도" 형식의 라벨
            date: new Date(currentDate), // 현재 날짜 객체를 저장
          });
          currentDate.setMonth(currentDate.getMonth() + 1); // 다음 달로 이동

          // 월의 첫 번째 날로 조정 (예: 31일로 인해 월이 건너뛰는 경우 방지)
          if (currentDate.getDate() !== 1) {
            currentDate.setDate(1);
          }
        }
        // 데이터 변환: 생성된 라벨에 따라 데이터의 날짜를 변환
        transformedData = data.map((d) => {
          const dateObj = new Date(d.date); // 데이터의 날짜를 객체로 변환
          const matchingDate = dates.find(
            (date) =>
              date.date.getFullYear() === dateObj.getFullYear() && // 연도 비교
              date.date.getMonth() === dateObj.getMonth() // 월 비교
          );
          return {
            ...d, // 기존 데이터 복사
            date: matchingDate // 매칭된 라벨이 있으면 사용, 없으면 기본 포맷 사용
              ? matchingDate.label
              : `${dateObj.getFullYear()}-${String(
                  dateObj.getMonth() + 1
                ).padStart(2, '0')}`, // 매칭 실패 시 "YYYY-MM" 형식으로 표시
          };
        });
        break;
      }

      case '주': {
        transformedData = data.map((d) => {
          const dateObj = new Date(d.date);
          const weekOfMonth = Math.ceil(
            (dateObj.getDate() + dateObj.getDay()) / 7
          );
          return {
            ...d,
            date: `${dateObj.getFullYear()}년 ${
              dateObj.getMonth() + 1
            }월 ${weekOfMonth}째주`,
          };
        });
        break;
      }

      case 'Week': {
        const startDate = new Date(d3.min(data, (d) => new Date(d.date)));
        const endDate = new Date(d3.max(data, (d) => new Date(d.date)));

        const weeks = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const year = currentDate.getFullYear();
          const month = currentDate.toLocaleString('en-US', { month: 'short' });
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

        transformedData = data.map((d) => {
          const dateObj = new Date(d.date);
          const matchingWeek = weeks.find(
            (week) =>
              week.date.getFullYear() === dateObj.getFullYear() &&
              week.date.getMonth() === dateObj.getMonth() &&
              Math.ceil(dateObj.getDate() / 7) ===
                Math.ceil(week.date.getDate() / 7)
          );

          return {
            ...d,
            date: matchingWeek
              ? matchingWeek.label
              : `${dateObj.getFullYear()}-${String(
                  dateObj.getMonth() + 1
                ).padStart(2, '0')}`,
          };
        });
        break;
      }

      case '년': {
        transformedData = data.map((d) => {
          const dateObj = new Date(d.date);
          return {
            ...d,
            date: `${dateObj.getFullYear()}년`, // 연도만 추출하여 새로운 라벨 생성
          };
        });
        break;
      }

      case 'Year': {
      }

      default: {
        transformedData = data;
        break;
      }
    }

    // 데이터를 그룹화
    const processedData = d3.group(transformedData, (d) => d.date);
    const xLabels = Array.from(processedData.keys());

    // funcname(함수 이름)의 고유 값 가져오기
    const funcnames = Array.from(
      new Set(transformedData.map((d) => d.funcname).filter(Boolean)) // null/undefined 값 제거
    );

    // 날짜별 funcname 매핑
    const dateFuncnames = new Map(
      Array.from(processedData, ([date, entries]) => [
        date,
        Array.from(new Set(entries.map((d) => d.funcname))),
      ])
    );

    // funcname에 따른 색상 설정
    const colorPalette = [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
      '#393b79',
      '#637939',
      '#8c6d31',
      '#843c39',
      '#7b4173',
      '#3182bd',
      '#6baed6',
      '#9ecae1',
      '#c6dbef',
      '#e6550d',
    ];

    const colorScale = d3
      .scaleOrdinal()
      .domain(Array.from(dateFuncnames.values()).flat())
      .range(colorPalette);

    // SVG 요소 생성
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right) // 전체 너비
      .attr('height', height + margin.top + margin.bottom) // 전체 높이
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`); // 차트 내부 여백 설정

    // X축 스케일 설정 (날짜)
    const x0 = d3.scaleBand().domain(xLabels).range([0, width]).padding(0.2); // X축 간격

    // Y축 스케일 설정 (값)
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(transformedData, (d) => d.count)])
      .nice() // 라운드 처리
      .range([height, 0]);

    // X축 그리기
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`) // X축 위치
      .call(d3.axisBottom(x0)) // X축 표시
      .selectAll('text')
      .attr('transform', 'rotate(-45)') // 텍스트 기울이기
      .style('text-anchor', 'end'); // 텍스트 정렬 설정

    svg
      .append('text') // X축 라벨
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 30)
      .text(t('BarChart.Date')); // 다국어 번역 텍스트

    // Y축 그리기
    svg.append('g').call(d3.axisLeft(y)); // Y축 표시

    svg
      .append('text') // Y축 라벨
      .attr('text-anchor', 'middle')
      .attr('x', -margin.left + 40) // 왼쪽으로 더 이동
      .attr('y', height / 2) // 차트 중앙에 배치
      .attr('dy', '0.35em') // 수직 중앙 정렬 보정
      .style('font-size', '14px') // 원하는 스타일 적용
      .text(t('BarChart.Value')); // 다국어 번역 텍스트

    // 툴팁 생성
    const tooltip = d3
      .select(chartRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('opacity', 0); // 초기 투명도 설정

    // 바 생성
    Array.from(processedData).forEach(([date, entries]) => {
      // 날짜별 funcname 가져오기
      const funcnamesForDate = dateFuncnames.get(date);

      // X1 스케일 설정 (funcname 간 간격)
      const x1 = d3
        .scaleBand()
        .domain(funcnamesForDate)
        .range([0, x0.bandwidth()])
        .padding(0.1);

      // 날짜 그룹 생성
      const dateGroup = svg
        .append('g')
        .attr('transform', `translate(${x0(date)}, 0)`);

      // 바 생성
      dateGroup
        .selectAll('rect')
        .data(entries)
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.funcname)) // funcname 위치
        .attr('y', (d) => y(d.count)) // 높이에 따른 위치
        .attr('width', x1.bandwidth()) // 바 너비
        .attr('height', (d) => height - y(d.count)) // 데이터 값에 따른 바 높이
        .attr('fill', (d) => colorScale(d.funcname)) // 색상 설정
        .on('mouseover', (_, d) => {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${d.funcname}</strong><br>${t('BarChart.Date')}: ${
                d.date
              }<br>${t('BarChart.Value')}: ${d.count}`
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

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width}, 0)`)
      .style('cursor', 'default'); // 마우스 이벤트 방지

    const itemsPerPage = 10;
    let currentPage = 0;

    const renderLegend = (page) => {
      legend.selectAll('*').remove(); // 이전 범례를 제거
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const visibleFuncnames = funcnames.slice(start, end);

      // 범례 배경 사각형
      legend
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 220)
        .attr('height', itemsPerPage * 25 + 50) // 아래에 페이지네이션 버튼 공간 추가
        .attr('fill', '#f9f9f9') // 배경색
        .attr('stroke', '#ccc') // 테두리 색상
        .attr('stroke-width', 1)
        .attr('rx', 10) // 모서리를 둥글게
        .attr('ry', 10); // 모서리를 둥글게

      // 각 funcname에 대한 범례 항목 생성
      visibleFuncnames.forEach((funcname, i) => {
        const legendRow = legend
          .append('g')
          .attr('transform', `translate(40, ${i * 25})`);

        legendRow
          .append('rect')
          .attr('x', -20)
          .attr('y', 0)
          .attr('width', 20)
          .attr('height', 20)
          .attr('fill', colorScale(funcname)); // 색상

        legendRow
          .append('text')
          .attr('x', 10)
          .attr('y', 15)
          .style('text-anchor', 'start')
          .text(funcname);
      });

      // 페이지네이션 버튼 생성
      const paginationGroup = legend
        .append('g')
        .attr('transform', `translate(0, ${itemsPerPage * 25})`);

      // 이전 버튼
      paginationGroup
        .append('text')
        .attr('x', 20)
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
        .attr('x', 95)
        .attr('y', 25)
        .text(
          `${currentPage + 1} / ${Math.ceil(funcnames.length / itemsPerPage)}`
        );

      // 다음 버튼
      paginationGroup
        .append('text')
        .attr('x', 160) // 기존 80에서 150으로 조정하여 오른쪽으로 이동
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

    d3.select(chartRef.current).on('wheel', (event) => {
      event.preventDefault();
      const delta = event.deltaY;

      if (delta > 0 && (currentPage + 1) * itemsPerPage < funcnames.length) {
        currentPage++;
      } else if (delta < 0 && currentPage > 0) {
        currentPage--;
      }

      renderLegend(currentPage);
    });

    if (dateTerm === 'Week') {
      const noticeGroup = svg
        .append('g')
        .attr('transform', `translate(0, -80)`);

      // 공지사항 배경 및 테두리
      const noticeWidth = 400;
      const noticeHeight = 30;
      const noticeX = (width - noticeWidth) / 2; // 중앙 정렬
      const noticeY = 40;

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
        .text(t('BarChart.Notification')); // 공지사항 텍스트
    }
  }, [data, t]); // 종속성 배열에 data와 t 추가

  return <div ref={chartRef} className="w-full h-full" />;
};

export default BarChart;
