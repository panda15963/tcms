import TomTomMap from '../../pages/mapPages/TomTomMap';

export default function TomTomMapHandler({
  selectedCoords,
  tomtomLocation,
  routeFullCoords,
  spaceFullCoords,
  checkedNode,
  clickedNode,
  routeColors = () => {},
}) {
  /**
   * TomTom 지도 표출 컴포넌트
   *
   * selectedCoords가 null이 아닐 경우, 해당 좌표(lat, lng)를 TomTomMap 컴포넌트에 전달하고,
   * 그렇지 않으면 tomtomLocation 좌표만 TomTomMap 컴포넌트에 전달합니다.
   */
  return (
    <>
      {selectedCoords && tomtomLocation ? (
        <TomTomMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tomtomLocation}
          routeFullCoords={routeFullCoords}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={spaceFullCoords}
        />
      ) : selectedCoords && tomtomLocation ? (
        <TomTomMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tomtomLocation}
          routeColors={routeColors}
          spaceFullCoords={spaceFullCoords}
        />
      ) : !selectedCoords && tomtomLocation? (
        <TomTomMap
          locationCoords={tomtomLocation}
          routeFullCoords={routeFullCoords}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={spaceFullCoords}
        />
      ) : tomtomLocation ? (
        <TomTomMap locationCoords={tomtomLocation} />
      ) : (
        <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>
      )}
    </>
  );
}
