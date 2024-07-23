import { useEffect, useRef, useState } from 'react';
import '../../style/MapStyle.css';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return { lat: defaultLat, lng: defaultLng };
}

export default function GoogleMap({ lat, lng }) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const [markers, setMarkers] = useState([initialCoords]);
  const [map, setMap] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
    setMarkers([newCenter]);
  }, [lat, lng]);

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API is not available.');
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: Number(process.env.REACT_APP_ZOOM),
      center: {
        lat: center.lat,
        lng: center.lng,
      },
      mapTypeControl: false,
    });

    const geocoderInstance = new window.google.maps.Geocoder();

    setMap(mapInstance);
    setGeocoder(geocoderInstance);

    mapInstance.addListener('click', (e) => {
      geocode({ location: e.latLng });
    });
  }, [center]);

  useEffect(() => {
    if (map) {
      markers.forEach((marker) => {
        new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: map,
        });
      });
    }
  }, [markers, map]);

  const geocode = (request) => {
    if (!geocoder) {
      console.error('Geocoder is not initialized.');
      return;
    }
    geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;
        const location = results[0].geometry.location;
        map.setCenter(location);        
        console.log(location.lat(), location.lng()) // 클릭시 좌표 얻기
      })
      .catch((e) => {
        alert('Geocode was not successful for the following reason: ' + e);
      });
  };

  return <div ref={mapRef} className="map" />;
}
