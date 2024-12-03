import { useState, useCallback, useMemo, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopMenuBar from '../components/navbars/TopMenuBar';
import LeftSideSlide from '../components/slideOver/LeftSideSlide';
import RightSideSlide from '../components/slideOver/RightSideSlide';

/**
 * MapLayout 컴포넌트
 * 
 * 지도와 관련된 레이아웃을 구성하며, 상단 메뉴 바, 좌측 및 우측 슬라이드 패널, 
 * 그리고 동적으로 렌더링되는 콘텐츠(Outlet)를 포함합니다.
 *
 * @returns {JSX.Element} 레이아웃 컴포넌트
 */
export default function MapLayout() {
  // 상태 정의
  const [routeData, setRouteData] = useState([]); // 경로 데이터
  const [checkedNodes, setCheckedNodes] = useState([]); // 체크된 노드
  const [clickedNode, setClickedNode] = useState(null); // 클릭된 노드
  const [currentApi, setCurrentApi] = useState(null); // 현재 사용 중인 지도 API
  const [routeColors, setRouteColors] = useState([]); // 경로 색상

  // 메모이제이션: 상태 변경으로 인한 불필요한 리렌더링 방지
  const memoizedRouteData = useMemo(() => routeData, [routeData]);
  const memoizedCheckedNodes = useMemo(() => checkedNodes, [checkedNodes]);

  /**
   * 경로 색상을 업데이트하는 핸들러
   * @param {string[] | string} colors - 새로운 색상 배열 또는 문자열
   */
  const handleRouteColors = useCallback((colors) => {
    setRouteColors((prevColors) => {
      let formattedColors = [];

      // colors를 배열 또는 문자열로 변환
      if (Array.isArray(colors)) {
        formattedColors = colors;
      } else if (typeof colors === 'string') {
        formattedColors = colors.split('');
      } else {
        console.warn('Unexpected format for colors:', colors);
        return prevColors;
      }

      // Hex 색상 형식으로 변환
      if (formattedColors.length > 0 && formattedColors[0].length === 1) {
        const groupedColors = [];
        for (let i = 0; i < formattedColors.length; i += 7) {
          if (formattedColors[i] === '#') {
            const colorChunk = formattedColors.slice(i, i + 7);
            if (colorChunk.length === 7) {
              groupedColors.push(colorChunk.join(''));
            }
          }
        }
        formattedColors = groupedColors;
      }

      // 새로운 색상만 추가
      const newColors = formattedColors.filter(
        (color) => !prevColors.includes(color)
      );
      return newColors.length > 0 ? [...prevColors, ...newColors] : prevColors;
    });
  }, []);

  /**
   * 경로 데이터를 업데이트하는 핸들러
   * @param {Array} data - 새로운 경로 데이터
   */
  const handleRouteData = useCallback((data) => {
    if (data !== routeData) {
      setRouteData(data);
    }
  }, [routeData]);

  /**
   * 체크된 노드를 업데이트하는 핸들러
   * @param {Array} nodes - 체크된 노드 배열
   */
  const handleCheckedNodes = useCallback((nodes) => {
    if (nodes !== checkedNodes) {
      setCheckedNodes(nodes);
    }
  }, [checkedNodes]);

  /**
   * 클릭된 노드를 업데이트하는 핸들러
   * @param {Object} node - 클릭된 노드 데이터
   */
  const handleClickedNode = useCallback((node) => {
    if (node !== clickedNode) {
      setClickedNode(node);
    }
  }, [clickedNode]);

  // currentApi 변경 시 실행되는 로직
  useEffect(() => {
    if (currentApi) {
      // API 변경에 따른 처리 로직 작성
    }
  }, [currentApi]);

  return (
    <>
      {/* 상단 메뉴 바 */}
      <TopMenuBar
        handleRouteData={handleRouteData}
        checkedNodes={memoizedCheckedNodes}
        clickedNode={clickedNode}
        setCurrentApi={setCurrentApi}
        routeColors={routeColors}
        handleSpaceData={(data) => setRouteData(data)} // 공간 데이터 핸들링
      />

      {/* 좌측 슬라이드 패널 */}
      <LeftSideSlide
        data={memoizedRouteData}
        onCheckedNodesChange={handleCheckedNodes}
        onClickedNode={handleClickedNode}
        onMapChange={currentApi}
        routeColors={handleRouteColors}
      />
      
      {/* 우측 슬라이드 패널 */}
      <RightSideSlide data={memoizedRouteData} onMapChange={currentApi} />

      {/* 중첩된 라우트를 렌더링하는 Outlet */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
