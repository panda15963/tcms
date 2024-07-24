export function ConvertToDEC(coords) {
  const DECLat = parseFloat(coords.lat).toFixed(6);
  const DECLng = parseFloat(coords.lng).toFixed(6);
  return { lat: DECLat, lng: DECLng };
}
