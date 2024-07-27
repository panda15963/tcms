export function DECToDEC(coords) {
  if (
    !coords ||
    typeof coords.lat !== 'number' ||
    typeof coords.lng !== 'number'
  ) {
    return { lat: '', lng: '' };
  }

  const DECLat = parseFloat(coords.lat).toFixed(6);
  const DECLng = parseFloat(coords.lng).toFixed(6);
  console.log(
    `DEC to DEC: ${coords.lat} ${coords.lng} -> ${DECLat} ${DECLng}`
  )
  return { lat: DECLat, lng: DECLng };
}
