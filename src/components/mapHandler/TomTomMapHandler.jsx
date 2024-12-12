import TomTomMap from '../../pages/mapPages/TomTomMap';

/**
 * TomTomMapHandler 컴포넌트
 * - TomTom 지도를 렌더링합니다.
 * - 선택된 좌표 또는 기본 위치 데이터를 기반으로 지도 표시
 *
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 (위도 및 경도)
 * @param {object} props.tomtomLocation - TomTom 지도 기본 위치 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 * @param {Array} props.checkedNode - 선택된 노드 데이터
 * @param {object} props.clickedNode - 클릭된 노드 데이터
 * @param {function} props.routeColors - 경로 색상 처리 함수
 */
export default function TomTomMapHandler({
  selectedCoords,
  tomtomLocation,
  routeFullCoords,
  spaceFullCoords,
  checkedNode,
  clickedNode,
  routeColors = () => {},
}) {
  if (!tomtomLocation) {
    return <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>;
  }

  return (
    <TomTomMap
      lat={selectedCoords?.lat}
      lng={selectedCoords?.lng}
      locationCoords={tomtomLocation}
      routeFullCoords={routeFullCoords}
      spaceFullCoords={spaceFullCoords}
      checkedNodes={checkedNode}
      clickedNode={clickedNode}
      routeColors={routeColors}
    />
  );
}
