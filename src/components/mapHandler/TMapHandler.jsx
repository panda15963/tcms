import TMap from '../../pages/mapPages/TMap';

export default function TMapHandler({ selectedCoords, tmapLocation }) {
  /**
   *  TMap 지도 표출 컴포넌트
   * 
   * selectedCoords가 null이 아닌 경우, 해당 좌표(lat, lng)를 TMap 컴포넌트에 전달하여 지도에 해당 좌표를 표시하고,
   * 그렇지 않으면 tmapLocation 좌표만 TMap 컴포넌트에 전달하여 기본 위치를 지도에 표시합니다.
   */
  return (
    <>
      {selectedCoords !== null ? (
        // 선택된 좌표가 있을 경우 해당 좌표(lat, lng)와 tmapLocation을 함께 전달
        <TMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tmapLocation}
        />
      ) : (
        // 선택된 좌표가 없을 경우 tmapLocation만 전달
        <TMap locationCoords={tmapLocation} />
      )}
    </>
  );
}
