import TomTomMap from '../../pages/mapPages/TomTomMap';

export default function TomTomCoords({ selectedCoords, tomtomLocation }) {
  return (
    <>
      {selectedCoords !== null ? (
        <TomTomMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tomtomLocation}
        />
      ) : (
        <TomTomMap locationCoords={tomtomLocation} />
      )}
    </>
  );
}
