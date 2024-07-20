import TomTomMap from "../../pages/mapPages/TomTomMap";

export default function TomTomCoords({ selectedCoords }) {
  return (
    <>
      {selectedCoords !== null ? (
        <TomTomMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
      ) : (
        <TomTomMap />
      )}
    </>
  );
}
