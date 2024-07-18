import { useEffect, useState } from 'react';
import '../style/MapStyle.css';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return { lat: defaultLat, lng: defaultLng };
}

export default function TMap({ lat, lng }) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [center, setCenter] = useState(initialCoords);
  const [markers, setMarkers] = useState([initialCoords]);
  console.log(lat, lng)
  useEffect(() => {
    const { Tmapv2 } = window;
    if (Tmapv2 && !mapLoaded) {
      initMap(Tmapv2);
      setMapLoaded(true);
    }
  }, [mapLoaded]);

  function initMap(Tmapv2) {
    const map = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(
        center.lat,
        center.lng
      ),
      zoom: Number(process.env.REACT_APP_ZOOM),
    });
    new Tmapv2.Marker({
      position: new Tmapv2.LatLng(
        markers[0].lat,
        markers[0].lng
      ),
      map: map,
      title: '모디엠',
    });
  }

  return (
    <>
      <main>
        <div id="map_div" className="map"></div>
      </main>
    </>
  );
}
