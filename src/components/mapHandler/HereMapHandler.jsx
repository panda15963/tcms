import React from 'react';
import HereMap from '../../pages/mapPages/HereMap';
import Error from '../alerts/Error';

/**
 * HereMapHandler 컴포넌트
 * - HERE Maps를 기반으로 지도를 렌더링합니다.
 * - 선택된 경로 및 공간 데이터를 필터링하고 HereMap 컴포넌트에 전달합니다.
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 (위도 및 경도)
 * @param {object} props.hereLocation - HERE 지도 위치 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.checkedNode - 선택된 노드 데이터
 * @param {object} props.clickedNode - 클릭된 노드 데이터
 * @param {function} props.routeColors - 경로 색상 처리 함수
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 */
export default function HereMapHandler({
  selectedCoords,
  hereLocation,
  routeFullCoords = [], // 기본값: 빈 배열
  checkedNode = [], // 기본값: 빈 배열
  clickedNode,
  routeColors = () => {}, // 기본값: 빈 함수
  spaceFullCoords,
}) {
  // checkedNode에서 file_id를 안전하게 추출
  const checkedFileIds = (checkedNode ?? []).map((node) => node.file_id);

  // 선택된 경로 필터링
  const filteredRoutes = (routeFullCoords ?? []).filter((route) =>
    checkedFileIds.includes(route.file_id)
  );

  // 선택된 공간 필터링
  const filteredSpaces = (spaceFullCoords ?? []).filter((space) =>
    checkedFileIds.includes(space.file_id)
  );

  return (
    <>
      {/* 조건에 따라 적절한 HereMap 컴포넌트를 렌더링 */}
      {selectedCoords && hereLocation ? (
        <HereMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={hereLocation}
          routeFullCoords={filteredRoutes} // 필터링된 경로 전달
          clickedNode={clickedNode}
          routeColors={routeColors} // 경로 색상 처리 함수 전달
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
          checkedNode={checkedNode} // 선택된 노드 전달
        />
      ) : selectedCoords && hereLocation ? (
        <HereMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={hereLocation}
          routeColors={routeColors} // 경로 색상 처리 함수 전달
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
          checkedNode={checkedNode} // 선택된 노드 전달
        />
      ) : !selectedCoords && hereLocation ? (
        <HereMap
          locationCoords={hereLocation}
          routeFullCoords={filteredRoutes} // 필터링된 경로 전달
          clickedNode={clickedNode}
          routeColors={routeColors} // 경로 색상 처리 함수 전달
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
          checkedNode={checkedNode} // 선택된 노드 전달
        />
      ) : hereLocation ? (
        <HereMap locationCoords={hereLocation} />
      ) : (
        <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />
      )}
    </>
  );
}
