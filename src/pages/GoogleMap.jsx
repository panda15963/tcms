import React, { useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import '../style/MapStyle.css';

export default function GoogleMap({ lat, lng }) {
  const initialCenter = {
    lat: Number(process.env.REACT_APP_LATITUDE),
    lng: Number(process.env.REACT_APP_LONGITUDE),
  };
  const coords = {
    lat: lat,
    lng: lng,
  };

  const chosenCoords =
    coords.lat !== undefined && coords.lng !== undefined
      ? coords
      : initialCenter;
  console.log(chosenCoords)
  return (
    <>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAP_API}>
        <Map
          className="map"
          defaultCenter={initialCenter}
          defaultZoom={Number(process.env.REACT_APP_ZOOM)}
        ></Map>
      </APIProvider>
    </>
  );
}
