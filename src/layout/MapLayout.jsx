import { useState, useCallback, useMemo, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopMenuBar from '../components/navbars/TopMenuBar';
import LeftSideSlide from '../components/slideOver/LeftSideSlide';
import RightSideSlide from '../components/slideOver/RightSideSlide';
import BasicType from '../assets/images/typeMap/type_basic.png';
import HybridType from '../assets/images/typeMap/type_hybrid.png';
import SatelliteType from '../assets/images/typeMap/type_satellite.png';

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
  const [isCleared, setIsCleared] = useState(false);
  const [mapType, setMapType] = useState({
    label: 'Basic Map',
    image: SatelliteType,
  });

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

  const handleClear = () => {
    setIsCleared(true); // Clear 상태 업데이트
    setTimeout(() => setIsCleared(false), 100); // Clear 상태를 짧은 시간 후 초기화 (선택 사항)
  };

  // 중복 데이터 제거 함수
  const removeDuplicates = (data) => {
    return data.reduce((acc, current) => {
      const isDuplicate = acc.find((item) => item.file_id === current.file_id);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);
  };

  // 중복 데이터 제거된 경로 데이터
  const uniqueRouteData = useMemo(() => {
    const uniqueData = removeDuplicates(memoizedRouteData);
    return uniqueData;
  }, [memoizedRouteData]);

  const cycleMapType = () => {
    if (currentApi?.name === 'TOMTOM' || currentApi?.name === 'HERE') {
      setMapType((prevType) => {
        if (prevType.label === 'Basic Map') {
          return { label: 'Satellite Map', image: BasicType };
        } else {
          return { label: 'Basic Map', image: SatelliteType };
        }
      });
    } else {
      setMapType((prevType) => {
        if (prevType.label === 'Basic Map') {
          return { label: 'Satellite Map', image: HybridType };
        } else if (prevType.label === 'Satellite Map') {
          return { label: 'Hybrid Map', image: BasicType };
        } else {
          return { label: 'Basic Map', image: SatelliteType };
        }
      });
    }
  };

  useEffect(() => {
    // currentApi가 변경될 때 기본 맵 타입으로 초기화
    setMapType({
      label: 'Basic Map',
      image: SatelliteType,
    });
  }, [currentApi]);

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

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
        handleSpaceData={(data) => {
          setRouteData(data);
        }}
        typeMap={mapType.label}
      />

      {/* 좌측 슬라이드와 버튼이 함께 움직이는 컨테이너 */}
      <div className="relative">
        <LeftSideSlide
          data={uniqueRouteData}
          onCheckedNodesChange={handleCheckedNodes}
          onClickedNode={handleClickedNode}
          onMapChange={currentApi}
          routeColors={handleRouteColors}
          isCleared={isCleared}
        />

        {/* 왼쪽 하단 버튼 */}
        <div className="absolute bottom-5 left-5 z-20">
          <button
            className="w-14 h-14 shadow-md hover:shadow-lg focus:outline-none cursor-default"
            style={{
              backgroundImage: `url(${mapType.image})`,
              backgroundSize: 'cover',
              userSelect: 'none',
            }}
            onClick={cycleMapType}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>

      {/* 오른쪽 슬라이드 */}
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
