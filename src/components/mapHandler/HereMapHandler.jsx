import React from 'react';
import HereMap from '../../pages/mapPages/HereMap';
import Error from '../alerts/Error';

/**
 * HereMapHandler 컴포넌트
 * - HERE Maps를 기반으로 지도를 렌더링합니다.
 * - 필터링된 경로 및 공간 데이터를 HereMap에 전달합니다.
 * - 위치 정보가 없을 경우 오류 메시지를 표시합니다.
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 (위도 및 경도)
 * @param {object} props.hereLocation - HERE 지도 위치 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.checkedNode - 선택된 노드 데이터
 * @param {object} props.clickedNode - 클릭된 노드 데이터
 * @param {function} props.routeColors - 경로 색상 처리 함수
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 * @param {function} props.onClearMap - 지도 초기화 함수
 * @param {string} props.selectedAPI - 선택된 API 키
 */
export default function HereMapHandler({
  selectedCoords,
  hereLocation,
  routeFullCoords = [],
  checkedNode = [],
  clickedNode,
  routeColors = () => {},
  spaceFullCoords = [],
  onClearMap,
  selectedAPI,
}) {
  // 선택된 노드에서 file_id를 추출
  const checkedFileIds = checkedNode.map((node) => node.file_id);

  // 경로 데이터를 안전하게 필터링
  const filteredRoutes = Array.isArray(routeFullCoords)
    ? routeFullCoords.filter((route) => checkedFileIds.includes(route.file_id))
    : [];

  // 공간 데이터를 안전하게 필터링
  const filteredSpaces = Array.isArray(spaceFullCoords)
    ? spaceFullCoords.filter((space) => checkedFileIds.includes(space.file_id))
    : [];

  // 위치 정보가 없을 경우 오류 메시지 컴포넌트를 반환
  if (!hereLocation) {
    return <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />;
  }

  // HereMap 컴포넌트를 렌더링
  return (
    <HereMap
      lat={selectedCoords?.lat} // 선택된 위도
      lng={selectedCoords?.lng} // 선택된 경도
      locationCoords={hereLocation} // HERE 지도 위치 데이터
      routeFullCoords={filteredRoutes} // 필터링된 경로 데이터
      clickedNode={clickedNode} // 클릭된 노드 데이터
      routeColors={routeColors} // 경로 색상 처리 함수
      spaceFullCoords={filteredSpaces} // 필터링된 공간 데이터
      checkedNode={checkedNode} // 선택된 노드 데이터
      onClearMap={onClearMap} // 지도 초기화 함수
      selectedAPI={selectedAPI} // 선택된 API 키
    />
  );
}
