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
 */
export default function BaiduMapHandler({
  selectedCoords,
  baiduLocation,
  origins,
  destinations,
  checkedNode,
  clickedNode,
}) {
  /**
   * 지도 렌더링 조건:
   * - `selectedCoords`가 있을 경우: 해당 좌표를 중심으로 지도 표시
   * - `origins`, `destinations`가 있을 경우: 경로 정보 포함
   * - `baiduLocation`만 있는 경우: 기본 위치만 표시
   * - 위치 정보가 없을 경우: 오류 메시지 출력
   */
  return (
    <>
      {selectedCoords && baiduLocation && origins && destinations ? (
        // 선택된 좌표와 경로 정보를 포함하여 지도 렌더링
        <BaiduMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={baiduLocation}
          origins={origins}
          destinations={destinations}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
        />
      ) : selectedCoords && baiduLocation ? (
        // 선택된 좌표만 지도에 렌더링
        <BaiduMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={baiduLocation}
        />
      ) : !selectedCoords && baiduLocation && origins && destinations ? (
        // 경로 정보와 기본 위치만 지도에 렌더링
        <BaiduMap
          locationCoords={baiduLocation}
          origins={origins}
          destinations={destinations}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
        />
      ) : baiduLocation ? (
        // 기본 위치만 지도에 렌더링
        <BaiduMap
          locationCoords={baiduLocation}
        />
      ) : (
        // 위치 정보가 없을 경우 오류 메시지 표시
        <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />
      )}
    </>
  );
}