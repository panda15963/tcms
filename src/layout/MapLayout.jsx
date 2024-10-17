import { useState } from 'react';
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
  const [routeColors, setRouteColors] = useState([]);

  // Capture route data
  const handleRouteData = (data) => {
    setRouteData(data);
  };

  // Capture checked nodes
  const handleCheckedNodes = (nodes) => {
    setCheckedNodes(nodes);
  };

  // Capture clicked node
  const handleClickedNode = (node) => {
    setClickedNode(node);
  };

  return (
    <>
      {/* 상단 메뉴바 */}
      <TopMenuBar
        handleRouteData={handleRouteData}
        checkedNodes={checkedNodes}
        clickedNode={clickedNode}
        setCurrentApi={setCurrentApi}
        routeColors={setRouteColors}
      />

      {/* 좌측 슬라이드 패널 */}
      <LeftSideSlide
        data={routeData}
        onCheckedNodesChange={handleCheckedNodes}
        onClickedNode={handleClickedNode}
        onMapChange={currentApi}
        routeColors={routeColors}
      />
      {/* 우측 슬라이드 패널 */}
      <RightSideSlide data={routeData} onMapChange={currentApi} />
      
      {/* Outlet은 중첩된 라우트에 의해 선택된 컴포넌트를 렌더링 */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
