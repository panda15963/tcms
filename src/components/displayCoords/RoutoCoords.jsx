import RoutoMap from "../../pages/RoutoMap";

export default function RoutoCoords({ selectedCoords }) {
  return (
    <>
      {selectedCoords !== null ? (
        <RoutoMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
      ) : (
        <RoutoMap />
      )}
    </>
  );
}
