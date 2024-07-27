export function DEGToDEC(coords) {
  const { lat, lng } = coords;

  function convertToDMSlat(decimal) {
    const degrees = Math.floor(decimal / 10000);
    const minutes = Math.floor((decimal % 10000) / 100);
    const seconds = (decimal % 100).toFixed(1);
    return `${degrees} ${minutes} ${seconds}`;
  }

  function convertToDMSlng(decimal) {
    const degrees = Math.floor(decimal / 1000);
    const minutes = Math.floor((decimal % 1000) / 100);
    const seconds = (decimal % 100).toFixed(1);
    return `${degrees} ${minutes} ${seconds}`;
  }

  function calculateDECLat(lat) {
    const partsLat = lat.split(' ');
    const degrees = parseFloat(partsLat[0]);
    const minutes = parseFloat(partsLat[1]) / 60;
    const seconds = parseFloat(partsLat[2]) / 3600;
    const latDEC = degrees + minutes + seconds;
    return latDEC.toFixed(6);
  }

  function calculateDECLng(lng) {
    const partsLng = lng.split(' ');
    const degrees = parseFloat(partsLng[0]);
    const minutes = parseFloat(partsLng[1]) / 60;
    const seconds = parseFloat(partsLng[2]) / 3600;
    const lngDEC = degrees + minutes + seconds;
    return lngDEC.toFixed(6);
  }

  const latDEC = calculateDECLat(convertToDMSlat(lat));
  const lngDEC = calculateDECLng(convertToDMSlng(lng));
  return { lat: latDEC, lng: lngDEC };
}
