import GoogleMap from '../../pages/GoogleMap';

export default function GoogleCoords(props) {
  const { selectedCoords } = props;
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
