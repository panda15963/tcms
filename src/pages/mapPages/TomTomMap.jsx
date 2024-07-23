import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);
  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return { lat: defaultLat, lng: defaultLng };
}

export default function TomTomMap({ lat, lng }) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.14.0/maps/maps-web.min.js';
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    };

    const initializeMap = () => {
      mapRef.current = tt.map({
        key: process.env.REACT_APP_TOMTOM_MAP_API,
        container: 'map-container',
        center: [center.lng, center.lat],
        zoom: Number(process.env.REACT_APP_ZOOM),
      });

      mapRef.current.on('click', (event) => {
        const { lat, lng } = event.lngLat;
        // setCenter({ lat, lng });
        console.log(lat, lng)
      });

      markerRef.current = new tt.Marker().setLngLat([center.lng, center.lat]).addTo(mapRef.current);
    };

    if (!window.tt) {
      loadScript();
    } else {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter([center.lng, center.lat]);
      markerRef.current.setLngLat([center.lng, center.lat]);
    }
  }, [center]);

  useEffect(() => {
    setCenter(calculateCenterAndMarker(lat, lng));
  }, [lat, lng]);

  return (
    <div>
      <div id="map-container" className="map"></div>
    </div>
  );
}
