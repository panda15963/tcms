export function MMSToDEG(coords) {
  const DECLat = parseFloat(coords.lat / 360000).toFixed(6);
  const DECLng = parseFloat(coords.lng / 360000).toFixed(6);
  const convertToDMS = (coord) => {
    const degrees = Math.floor(coord);
    const minutes = Math.floor((coord - degrees) * 60);
    const seconds = (((coord - degrees) * 60 - minutes) * 60).toFixed(1);

    return `${degrees} ${minutes} ${seconds}`;
  };
  console.log(
    `MMS to DEG: ${coords.lat} ${coords.lng} -> ${DECLat} ${DECLng}`
  );
  return {
    lat: convertToDMS(DECLat),
    lng: convertToDMS(DECLng),
  };
}
