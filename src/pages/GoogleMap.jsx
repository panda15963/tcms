import React, { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import '../style/MapStyle.css';

export default function GoogleMap({ lat, lng }) {
  const initialCenter = {
    lat: Number(process.env.REACT_APP_LATITUDE),
    lng: Number(process.env.REACT_APP_LONGITUDE),
  };

  const chosenCoords = (lat !== undefined && lng !== undefined) ? { lat, lng } : initialCenter;

  const [markers, setMarkers] = useState([initialCenter]);
  const [center, setCenter] = useState(initialCenter);

  useEffect(() => {
    setMarkers([{ lat: chosenCoords.lat, lng: chosenCoords.lng }]);
    setCenter(chosenCoords);
  }, [lat, lng, chosenCoords.lat, chosenCoords.lng]);

  return (
    <>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API}>
        <Map
          className="map"
          defaultCenter={center}
          defaultZoom={Number(process.env.REACT_APP_ZOOM)}
        >
          {markers.map((marker, index) => (
            <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} />
          ))}
        </Map>
      </APIProvider>
    </>
  );
}
