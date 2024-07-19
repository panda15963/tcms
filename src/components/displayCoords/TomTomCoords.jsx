import TomTomMap from "../../pages/TomTomMap";

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
