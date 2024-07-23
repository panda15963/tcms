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

export default function TMap({ lat, lng }) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  useEffect(() => {
    if (!window.Tmapv2) {
      const scriptUrl = `https://api2.sktelecom.com/tmap/js?version=1&appKey=${process.env.REACT_APP_TMAP_API}`;
      console.log('Loading script:', scriptUrl);

      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        console.log('Tmap script loaded');
        initMap();
      };
      script.onerror = () => {
        console.error('Failed to load Tmap script from URL:', scriptUrl);
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      updateMapCenter();
    }
  }, [center]);

  function initMap() {
    if (mapRef.current) return;

    const { Tmapv2 } = window;
    mapRef.current = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(center.lat, center.lng),
      zoom: Number(process.env.REACT_APP_ZOOM),
    });

    mapRef.current.addListener('click', (evt) => {
      const clickedLat = evt.latLng.lat();
      const clickedLng = evt.latLng.lng();
      // setCenter({ lat: clickedLat, lng: clickedLng });
      console.log(clickedLat, clickedLng)
    });

    updateMapCenter();
  }

  function updateMapCenter() {
    const { Tmapv2 } = window;
    if (mapRef.current && Tmapv2) {
      mapRef.current.setCenter(new Tmapv2.LatLng(center.lat, center.lng));

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(center.lat, center.lng),
        map: mapRef.current,
      });
    }
  }

  return <div id="map_div" className="map" />;
}
