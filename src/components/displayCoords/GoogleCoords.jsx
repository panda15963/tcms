import GoogleMap from '../../pages/GoogleMap';

export default function GoogleCoords({ selectedCoords }) {
  return (
    <>
      {selectedCoords !== null ? (
        <GoogleMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
      ) : (
        <GoogleMap />
      )}
    </>
  );
}
