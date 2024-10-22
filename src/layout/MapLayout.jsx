import { useState, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import TopMenuBar from '../components/navbars/TopMenuBar';
import LeftSideSlide from '../components/slideOver/LeftSideSlide';
import RightSideSlide from '../components/slideOver/RightSideSlide';

// MapLayout 컴포넌트 정의
export default function MapLayout() {
  const [routeData, setRouteData] = useState([]);
  const [checkedNodes, setCheckedNodes] = useState([]);
  const [clickedNode, setClickedNode] = useState(null);
  const [currentApi, setCurrentApi] = useState(null);
  const [routeColors, setRouteColors] = useState(null);

  const memoizedRouteData = useMemo(() => routeData, [routeData]);
  const memoizedCheckedNodes = useMemo(() => checkedNodes, [checkedNodes]);
  const memoizedRouteColors = useMemo(() => routeColors, [routeColors]);

  const handleRouteData = useCallback(
    (data) => {
      if (data !== routeData) {
        setRouteData(data);
      }
    },
    [routeData],
  );

  const handleCheckedNodes = useCallback(
    (nodes) => {
      if (nodes !== checkedNodes) {
        setCheckedNodes(nodes);
      }
    },
    [checkedNodes],
  );

  const handleClickedNode = useCallback(
    (node) => {
      if (node !== clickedNode) {
        setClickedNode(node);
      }
    },
    [clickedNode],
  );

  const handleRouteColors = useCallback(
    (colors) => {
      // Check if the new colors are the same as the current state to avoid setting the state repeatedly
      if (JSON.stringify(colors) !== JSON.stringify(routeColors)) {
        setRouteColors(colors);
      }
    },
    [routeColors],
  );

  return (
    <>
      {/* 상단 메뉴바 */}
      <TopMenuBar
        handleRouteData={handleRouteData}
        checkedNodes={memoizedCheckedNodes}
        clickedNode={clickedNode}
        setCurrentApi={setCurrentApi}
        routeColors={handleRouteColors}
        handleSpaceData={
          // Add handleSpaceData to props
          (data) => {
            setRouteData(data);
          }
        }
      />

      {/* 좌측 슬라이드 패널 */}
      <LeftSideSlide
        data={memoizedRouteData}
        onCheckedNodesChange={handleCheckedNodes}
        onClickedNode={handleClickedNode}
        onMapChange={currentApi}
        routeColors={memoizedRouteColors}
      />
      {/* 우측 슬라이드 패널 */}
      <RightSideSlide data={memoizedRouteData} onMapChange={currentApi} />

      {/* Outlet은 중첩된 라우트에 의해 선택된 컴포넌트를 렌더링 */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
