import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import '../style/MapStyle.css';

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

  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
    setMarkers([newCenter]);
  }, [lat, lng]);

  return (
    <>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API}>
        {center.lat === parseFloat(process.env.REACT_APP_LATITUDE) &&
        center.lng === parseFloat(process.env.REACT_APP_LONGITUDE) ? (
          <Map
            className="map"
            defaultCenter={center}
            defaultZoom={Number(process.env.REACT_APP_ZOOM)}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
              />
            ))}
          </Map>
        ) : (
          <Map
            className="map"
            center={center}
            defaultZoom={Number(process.env.REACT_APP_ZOOM)}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
              />
            ))}
          </Map>
        )}
      </APIProvider>
    </>
  );
}