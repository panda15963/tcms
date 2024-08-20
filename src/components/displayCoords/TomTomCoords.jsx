import TomTomMap from '../../pages/mapPages/TomTomMap';

export default function TomTomCoords({ selectedCoords, tomtomLocation }) {
  /**
   * TomTom 지도 표출 컴포넌트
   *
   * selectedCoords가 null이 아닐 경우, 해당 좌표(lat, lng)를 TomTomMap 컴포넌트에 전달하고,
   * 그렇지 않으면 tomtomLocation 좌표만 TomTomMap 컴포넌트에 전달합니다.
   */
  return (
    <>
      {selectedCoords !== null ? (
        // 선택된 좌표가 있을 경우 해당 좌표(lat, lng)와 tomtomLocation을 함께 전달
        <TomTomMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tomtomLocation}
        />
      ) : (
        // 선택된 좌표가 없을 경우 tomtomLocation만 전달
        <TomTomMap locationCoords={tomtomLocation} />
      )}
    </>
  );
}
