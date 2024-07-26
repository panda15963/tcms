export function DEGToDEC(coords) {
  const convertToOriginal = (coords) => {
    const [degrees, minutes, seconds] = coords.split(' ');
    return (
      parseFloat(degrees) +
      parseFloat(minutes) / 60 +
      parseFloat(seconds) / 3600
    );
  };
  const [lat, lon] = coords.split(',').map(convertToOriginal);
  return { lat, lng: lon };
}
