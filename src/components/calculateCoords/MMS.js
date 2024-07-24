export function ConvertToMMS(coords) {
  const MMSLat = parseInt(coords.lat * 360000);
  const MMSLng = parseInt(coords.lng * 360000);
  return { lat: MMSLat, lng: MMSLng };
}
