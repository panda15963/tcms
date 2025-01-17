import BaiduMap from '../../pages/mapPages/BaiduMap';
import Error from '../alerts/Error';

/**
 * BaiduMapHandler 컴포넌트
 * - BaiduMap 지도를 렌더링하거나 위치 정보가 없는 경우 오류 메시지를 표시
 *
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 객체 (lat, lng 포함)
 * @param {object} props.baiduLocation - Baidu 지도의 기본 위치 정보
 * @param {Array} props.origins - 출발지 배열
 * @param {Array} props.destinations - 도착지 배열
 * @param {Array} props.checkedNode - 선택된 노드 목록
 * @param {object} props.clickedNode - 클릭된 노드 정보
 * @param {string} props.selectedAPI - 선택된 API 키
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.routeColors - 경로 색상 배열
 * @param {function} props.onClearMap - 지도 초기화 함수
 * @param {string} props.typeMap - 지도 유형
 */
export default function BaiduMapHandler({
  selectedCoords,
  baiduLocation,
  origins,
  destinations,
  checkedNode,
  clickedNode,
  selectedAPI,
  spaceFullCoords,
  routeFullCoords,
  routeColors,
  onClearMap,
  typeMap,
}) {
  if (!baiduLocation) {
    return <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />;
  }

  return (
    <BaiduMap
      lat={selectedCoords?.lat}
      lng={selectedCoords?.lng}
      locationCoords={baiduLocation}
      origins={origins}
      destinations={destinations}
      checkedNodes={checkedNode}
      clickedNode={clickedNode}
      selectedAPI={selectedAPI}
      spaceFullCoords={spaceFullCoords}
      routeFullCoords={routeFullCoords}
      routesColors={routeColors}
      onClearMap={onClearMap}
      typeMap={typeMap}
    />
  );
}
