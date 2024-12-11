import React from 'react';
import HereMap from '../../pages/mapPages/HereMap';
import Error from '../alerts/Error';

/**
 * HereMapHandler 컴포넌트
 * - HERE Maps를 기반으로 지도를 렌더링합니다.
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성
 */
export default function HereMapHandler({
  selectedCoords,
  hereLocation,
  routeFullCoords = [],
  checkedNode = [],
  clickedNode,
  routeColors = () => {},
  spaceFullCoords = [],
}) {
  const checkedFileIds = checkedNode.map((node) => node.file_id);

  // Safely filter routes and spaces
  const filteredRoutes = Array.isArray(routeFullCoords)
    ? routeFullCoords.filter((route) => checkedFileIds.includes(route.file_id))
    : [];
  const filteredSpaces = Array.isArray(spaceFullCoords)
    ? spaceFullCoords.filter((space) => checkedFileIds.includes(space.file_id))
    : [];

  if (!hereLocation) {
    return <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />;
  }

  return (
    <HereMap
      lat={selectedCoords?.lat}
      lng={selectedCoords?.lng}
      locationCoords={hereLocation}
      routeFullCoords={filteredRoutes}
      clickedNode={clickedNode}
      routeColors={routeColors}
      spaceFullCoords={filteredSpaces}
      checkedNode={checkedNode}
    />
  );
}
