export function MMSToDEC(coords) {
  const DECLat = parseFloat(coords.lat / 360000).toFixed(6);
  const DECLng = parseFloat(coords.lng / 360000).toFixed(6);
  console.log(
    `MMS to DEC: ${coords.lat} ${coords.lng} -> ${DECLat} ${DECLng}`
  );
  return { lat: DECLat, lng: DECLng };
}