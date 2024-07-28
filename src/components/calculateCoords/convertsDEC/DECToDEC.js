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
  
  return { lat: DECLat, lng: DECLng };
}
