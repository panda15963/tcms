import TMap from '../../pages/mapPages/TMap';

export default function TMapCoords({ selectedCoords, tmapLocation }) {
  return (
    <>
      {selectedCoords !== null ? (
        <TMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tmapLocation}
        />
      ) : (
        <TMap locationCoords={tmapLocation} />
      )}
    </>
  );
}
