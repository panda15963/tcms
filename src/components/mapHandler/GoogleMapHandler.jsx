import GoogleMap from '../../pages/mapPages/GoogleMap';

export default function GoogleMapHandler({
  selectedCoords,
  googleLocation,
  origins,
  destinations,
}) {
  /**
   * GoogleMap 지도 표시 핸들러
   *
   * 이 컴포넌트는 선택된 좌표(selectedCoords), googleLocation, 출발지(origins), 목적지(destinations)의
   * 값에 따라 GoogleMap 컴포넌트에 적절한 데이터를 전달하여 지도를 렌더링합니다.
   *
   * 조건별 동작:
   * 1. selectedCoords, googleLocation, origins, destinations 모두 존재할 경우:
   *    - 선택된 좌표를 기준으로 지도에 마커를 표시하고, 경로(origins과 destinations)를 함께 표시합니다.
   *
   * 2. selectedCoords와 googleLocation만 존재할 경우:
   *    - 선택된 좌표를 지도에 마커로 표시하고, 추가적인 경로는 표시하지 않습니다.
   *
   * 3. selectedCoords는 없고, googleLocation, origins, destinations이 존재할 경우:
   *    - googleLocation을 기준으로 기본 위치를 지도에 표시하며, 경로(origins과 destinations)를 함께 표시합니다.
   *
   * 4. googleLocation만 존재할 경우:
   *    - 기본 위치(googleLocation)만 지도에 표시합니다.
   *
   * 5. googleLocation이 없을 경우:
   *    - 지도를 표시할 수 없으며, 에러 메시지를 표시합니다.
   */
  const parseCoordinates = (coordArray) => {
    return coordArray.map((coord) => {
      const [lng, lat] = coord.split(',').map(Number);
      return { lat, lng };
    });
  };
  const parsedOrigins = parseCoordinates(origins);
  const parsedDestinations = parseCoordinates(destinations);
  console.log(parsedOrigins, parsedDestinations)
  return (
    <>
      {selectedCoords && googleLocation && origins && destinations ? (
        // 모든 조건이 만족하는 경우, 선택된 좌표와 경로를 표시
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
          origins={origins}
          destinations={destinations}
        />
      ) : selectedCoords && googleLocation ? (
        // 선택된 좌표와 googleLocation만 있는 경우, 선택된 좌표만 표시
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
        />
      ) : !selectedCoords && googleLocation && origins && destinations ? (
        // 선택된 좌표는 없지만, googleLocation과 경로가 있는 경우, 경로만 표시
        <GoogleMap
          locationCoords={googleLocation}
          origins={origins}
          destinations={destinations}
        />
      ) : googleLocation ? (
        // googleLocation만 있는 경우, 기본 위치만 지도에 표시
        <GoogleMap locationCoords={googleLocation} />
      ) : (
        // googleLocation이 없는 경우, 에러 메시지 출력
        <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>
      )}
    </>
  );
}
