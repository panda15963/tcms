import BaiduMap from '../../pages/mapPages/BaiduMap';
import Error from '../alerts/Error';

export default function BaiduMapHandler({
  selectedCoords,
  baiduLocation,
  origins,
  destinations,
  checkedNode,
  clickedNode,
}) {
  /**
   * BaiduMap 지도 표출 컴포넌트
   *
   * selectedCoords가 null이 아닌 경우, 해당 좌표(lat, lng)를 BaiduMap 컴포넌트에 전달하여 지도에 해당 좌표를 표시하고,
   * 그렇지 않으면 baiduLocation 좌표만 BaiduMap 컴포넌트에 전달하여 기본 위치를 지도에 표시합니다.
   */
  return (
    <>
      {selectedCoords && baiduLocation && origins && destinations ? (
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
        <BaiduMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={baiduLocation}
        />
      ) : !selectedCoords && baiduLocation && origins && destinations ? (
        <BaiduMap
          locationCoords={baiduLocation}
          origins={origins}
          destinations={destinations}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
        />
      ) : baiduLocation ? (
        <BaiduMap
          locationCoords={baiduLocation}
        />
      ) : (
        <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />
      )}
    </>
  );
}
