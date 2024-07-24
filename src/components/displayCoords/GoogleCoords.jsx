import GoogleMap from '../../pages/mapPages/GoogleMap';

export default function GoogleCoords({ selectedCoords, googleLocation }) {
  return (
    <>
      {selectedCoords !== null ? (
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
        />
      ) : (
        <GoogleMap locationCoords={googleLocation} />
      )}
    </>
  );
}
