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
  const [routeData, setRouteData] = useState([]);
  const [checkedNodes, setCheckedNodes] = useState([]);
  const [clickedNode, setClickedNode] = useState(null);
  const [currentApi, setCurrentApi] = useState(null);
  const [routeColors, setRouteColors] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [isCleared, setIsCleared] = useState(false);

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

  const handleRouteData = useCallback(
    (data) => {
      if (data !== routeData) {
        setRouteData(data);
      }
    },
    [routeData]
  );

  const handleCheckedNodes = useCallback(
    (nodes) => {
      if (nodes !== checkedNodes) {
        setCheckedNodes(nodes);
      }
    },
    [checkedNodes]
  );

  const handleClickedNode = useCallback(
    (node) => {
      if (node !== clickedNode) {
        setClickedNode(node);
      }
    },
    [clickedNode]
  );

  // currentApi 변경 시 실행되는 로직
  useEffect(() => {
    if (currentApi) {
      // API 변경에 따른 처리 로직 작성
    }
  }, [currentApi]);

  const handleClear = () => {
    setIsCleared(true); // Clear 상태 업데이트
    setTimeout(() => setIsCleared(false), 100); // Clear 상태를 짧은 시간 후 초기화 (선택 사항)
  };

  const removeDuplicates = (data) => {
    return data.reduce((acc, current) => {
      const isDuplicate = acc.find((item) => item.file_id === current.file_id);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);
  };

  const uniqueRouteData = useMemo(() => {
    const uniqueData = removeDuplicates(memoizedRouteData);
    setAlertMessage(`Found ${uniqueData.length} unique routes.`);
    return uniqueData;
  }, [memoizedRouteData]);

  return (
    <>
      {/* 상단 메뉴 바 */}
      <TopMenuBar
        handleRouteData={handleRouteData}
        checkedNodes={memoizedCheckedNodes}
        clickedNode={clickedNode}
        setCurrentApi={setCurrentApi}
        routeColors={routeColors}
        onClear={handleClear}
        handleSpaceData={
          // Add handleSpaceData to props
          (data) => {
            setRouteData(data);
          }
        }
      />

      {/* 좌측 슬라이드 패널 */}
      <LeftSideSlide
        data={uniqueRouteData}
        onCheckedNodesChange={handleCheckedNodes}
        onClickedNode={handleClickedNode}
        onMapChange={currentApi}
        routeColors={handleRouteColors}
        isCleared={isCleared}
      />

      {/* 우측 슬라이드  */}
      <RightSideSlide
        data={uniqueRouteData}
        onMapChange={currentApi}
        isCleared={isCleared}
      />

      {/* 중첩된 라우트를 렌더링하는 Outlet */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
