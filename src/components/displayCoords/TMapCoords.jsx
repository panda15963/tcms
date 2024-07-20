import TMap from '../../pages/mapPages/TMap';

export default function TMapCoords({ selectedCoords }) {
  return (
    <>
      {selectedCoords !== null ? (
        <TMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
      ) : (
        <TMap />
      )}
    </>
  );
}
