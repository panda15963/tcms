import RoutoMap from '../../pages/mapPages/RoutoMap';

export default function RoutoCoords({ selectedCoords, routoLocation }) {
  return (
    <>
      {selectedCoords !== null ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
        />
      ) : (
        <RoutoMap locationCoords={routoLocation} />
      )}
    </>
  );
}
