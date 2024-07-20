import GoogleMap from '../../pages/mapPages/GoogleMap';

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
