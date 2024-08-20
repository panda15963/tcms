import BaiduMap from '../../pages/mapPages/BaiduMap';

export default function BaiduCoords({ selectedCoords, baiduLocation }) {
  /**
   * BaiduMap 지도 표출 컴포넌트
   * 
   * selectedCoords가 null이 아닌 경우, 해당 좌표(lat, lng)를 BaiduMap 컴포넌트에 전달하여 지도에 해당 좌표를 표시하고,
   * 그렇지 않으면 baiduLocation 좌표만 BaiduMap 컴포넌트에 전달하여 기본 위치를 지도에 표시합니다.
   */
  return (
    <>
      {selectedCoords !== null ? (
        // 선택된 좌표가 있을 경우 해당 좌표(lat, lng)와 baiduLocation을 함께 전달
        <BaiduMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={baiduLocation}
        />
      ) : (
        // 선택된 좌표가 없을 경우 baiduLocation만 전달
        <BaiduMap locationCoords={baiduLocation} />
      )}
    </>
  );
}
