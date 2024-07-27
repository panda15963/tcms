export function DECToMMS(coords) {
  const MMSLat = parseInt(coords.lat * 360000);
  const MMSLng = parseInt(coords.lng * 360000);
  console.log(
    `DEC to MMS: ${coords.lat} ${coords.lng} -> ${MMSLat} ${MMSLng}`
  );
  return { lat: MMSLat, lng: MMSLng };
}

