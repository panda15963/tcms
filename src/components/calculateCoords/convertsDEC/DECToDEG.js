export function DECToDEG(coords) {
  const convertToDMS = (coord) => {
    const degrees = Math.floor(coord);
    const minutes = Math.floor((coord - degrees) * 60);
    const seconds = (((coord - degrees) * 60 - minutes) * 60).toFixed(1);

    return `${degrees} ${minutes} ${seconds}`;
  };

  const DEGLat = convertToDMS(coords.lat);
  const DEGLng = convertToDMS(coords.lng);
  
  return {
    lat: DEGLat,
    lng: DEGLng,
  };
}
