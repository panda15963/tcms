import GoogleMap from '../../pages/mapPages/GoogleMap';

export default function GoogleCoords({ selectedCoords, googleLocation }) {
  /**
   * GoogleMap 지도 표출 컴포넌트
   * 
   * selectedCoords가 null이 아닌 경우, 해당 좌표(lat, lng)를 GoogleMap 컴포넌트에 전달하여 지도에 해당 좌표를 표시하고,
   * 그렇지 않으면 googleLocation 좌표만 GoogleMap 컴포넌트에 전달하여 기본 위치를 지도에 표시합니다.
   */
  return (
    <>
      {selectedCoords !== null ? (
        // 선택된 좌표가 있을 경우 해당 좌표(lat, lng)와 googleLocation을 함께 전달
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
        />
      ) : (
        // 선택된 좌표가 없을 경우 googleLocation만 전달
        <GoogleMap locationCoords={googleLocation} />
      )}
    </>
  );
}
