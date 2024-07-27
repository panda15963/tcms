export function MMSToMMS(coords) {
  if (
    !coords ||
    typeof coords.lat !== 'number' ||
    typeof coords.lng !== 'number'
  ) {
    return { lat: '', lng: '' };
  }

  const MMSLat = parseInt(coords.lat);
  const MMSLng = parseInt(coords.lng)
  console.log(MMSLat,MMSLng)
  return { lat: MMSLat, lng: MMSLng };
}