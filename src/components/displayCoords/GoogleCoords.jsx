import GoogleMap from '../../pages/GoogleMap';

export default function GoogleCoords({ selectedCoords }) {
  return (
    <div>
      {selectedCoords !== null ? (
        <GoogleMap lat={selectedCoords.lat} lng={selectedCoords.lng} />
      ) : (
        <GoogleMap />
      )}
    </div>
  );
}
