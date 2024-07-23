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

export default function RoutoMap({ lat, lng }) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.routo.com/v2/maps/map?key=' +
        process.env.REACT_APP_ROUTTO_MAP_API;
      script.async = true;
      script.onload = () => {
        mapRef.current = new routo.maps.Map('map', {
          center: {
            lat: center.lat,
            lng: center.lng,
          },
          zoom: Number(process.env.REACT_APP_ZOOM),
        });
        markerRef.current = new routo.maps.Marker({
          position: {
            lat: center.lat,
            lng: center.lng,
          },
          map: mapRef.current,
        });

        // Add click event listener
        mapRef.current.addListener('click', (event) => {
          const clickedLat = event.latLng.lat();
          const clickedLng = event.latLng.lng();
          setCenter({ lat: clickedLat, lng: clickedLng });
          markerRef.current.setPosition({ lat: clickedLat, lng: clickedLng });
        });
      };
      document.body.appendChild(script);
    };
    if (!window.routo) {
      loadScript();
    } else {
      mapRef.current = new routo.maps.Map('map', {
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        zoom: Number(process.env.REACT_APP_ZOOM),
      });
      markerRef.current = new routo.maps.Marker({
        position: {
          lat: center.lat,
          lng: center.lng,
        },
        map: mapRef.current,
      });

      mapRef.current.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        console.log(clickedLat, clickedLng) // 클릭시 좌표 얻기
      });
    }
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newCenter = calculateCenterAndMarker(lat, lng);
      setCenter(newCenter);
      mapRef.current.setCenter(newCenter);
      markerRef.current.setPosition(newCenter);
    }
  }, [lat, lng]);

  return <div id="map" className="map"></div>;
}
