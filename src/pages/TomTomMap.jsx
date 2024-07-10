import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect } from 'react';
import '../style/MapStyle.css';

export default function TomTomMap() {
  useEffect(() => {
    const map = tt.map({
      key: process.env.REACT_APP_TOMTOM_MAP_API,
      container: 'map-container',
      center: { lat: Number(process.env.REACT_APP_LATITUDE), lng: Number(process.env.REACT_APP_LONGITUDE) },
      zoom: Number(process.env.REACT_APP_ZOOM),
    });

    new tt.Marker().setLngLat({ lat: Number(process.env.REACT_APP_LATITUDE), lng: Number(process.env.REACT_APP_LONGITUDE) }).addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div>
      <div id="map-container" className="map" ></div>
    </div>
  );
}