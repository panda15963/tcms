export function DEGToDEC(coords) {
  const { lat, lng } = coords;
  console.log(coords, typeof(coords), typeof(lat));

  function formatToDEG(decimal) {
    const degrees = Math.floor(decimal);
    const minutesFull = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesFull);
    const seconds = (minutesFull - minutes) * 60;
    return `${degrees} ${minutes} ${seconds.toFixed(1)}`;
  }

  function calculateDECLat(lat) {
    const partsLat = formatToDEG(lat).split(' ');
    if (partsLat.length !== 3) throw new Error('Invalid latitude format');
    const degrees = parseFloat(partsLat[0]);
    const minutes = parseFloat(partsLat[1]) / 60;
    const seconds = parseFloat(partsLat[2]) / 3600;
    const latDEC = degrees + minutes + seconds;
    return latDEC.toFixed(6);
  }

  function calculateDECLng(lng) {
    const partsLng = formatToDEG(lng).split(' ');
    if (partsLng.length !== 3) throw new Error('Invalid longitude format');
    const degrees = parseFloat(partsLng[0]);
    const minutes = parseFloat(partsLng[1]) / 60;
    const seconds = parseFloat(partsLng[2]) / 3600;
    const lngDEC = degrees + minutes + seconds;
    return lngDEC.toFixed(6);
  }

  try {
    const latDEC = calculateDECLat(lat);
    const lngDEC = calculateDECLng(lng);
    return { lat: latDEC, lng: lngDEC };
  } catch (error) {
    console.error(error.message);
    return { lat: 'Invalid', lng: 'Invalid' };
  }
}
