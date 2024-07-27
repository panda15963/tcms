export function DEGToDEG(coords) {
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

  const latDMS = convertToDMSlat(lat);
  const lngDMS = convertToDMSlng(lng);
  console.log(
    `DEG to DEG: ${lat} ${lng} -> ${latDMS} ${lngDMS}`
  );
  return { lat: latDMS, lng: lngDMS };
}
