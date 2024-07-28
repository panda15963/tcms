export function MMSToDEC(coords) {
  const DECLat = parseFloat(coords.lat / 360000).toFixed(6);
  const DECLng = parseFloat(coords.lng / 360000).toFixed(6);
  
  return { lat: DECLat, lng: DECLng };
}