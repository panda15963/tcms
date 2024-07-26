export function DEGToMMS(coords) {
    const convertToOriginal = (coords) => {
        const [degrees, minutes, seconds] = coords.split(' ');
        return (
        parseFloat(degrees) +
        parseFloat(minutes) / 60 +
        parseFloat(seconds) / 3600
        );
    };
    const [lat, lon] = coords.split(',').map(convertToOriginal);
    const MMSLat = parseInt(lat * 360000);
    const MMSLng = parseInt(lon * 360000);
    return { lat: MMSLat, lng: MMSLng };
}
