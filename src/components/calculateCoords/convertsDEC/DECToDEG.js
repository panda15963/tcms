export function DECToDEG(coords) {
  const convertToDMS = (coord) => {
    const degrees = Math.floor(coord);
    const minutes = Math.floor((coord - degrees) * 60);
    const seconds = (((coord - degrees) * 60 - minutes) * 60).toFixed(1);

    return `${degrees} ${minutes} ${seconds}`;
  };

  const DEGLat = convertToDMS(coords.lat);
  const DEGLng = convertToDMS(coords.lng);
  console.log(
    `DEC to DEG: ${coords.lat} ${coords.lng} -> ${DEGLat} ${DEGLng}`
  );
  return {
    lat: DEGLat,
    lng: DEGLng,
  };
}
