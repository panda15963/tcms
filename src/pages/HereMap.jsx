import H from '@here/maps-api-for-javascript';
import { useEffect, useRef } from 'react';
import '../style/MapStyle.css';

export default function HereMap() {
  const mapRef = useRef(null);
  const map = useRef(null);
  const platform = useRef(null);
  const API_KEY = process.env.REACT_APP_HERE_MAP_API;

  useEffect(() => {
    if (!map.current) {
      platform.current = new H.service.Platform({
        apikey: API_KEY,
      });
      const defaultLayers = platform.current.createDefaultLayers({
        pois: true,
      });
      const newMap = new H.Map(
        mapRef.current,
        defaultLayers.vector.normal.map,
        {
          zoom: Number(process.env.REACT_APP_ZOOM),
          center: { lat: Number(process.env.REACT_APP_LATITUDE), lng: Number(process.env.REACT_APP_LONGITUDE) },
        },
      );
      new H.mapevents.Behavior(
        new H.mapevents.MapEvents(newMap),
      );
      map.current = newMap;
    }
  }, [API_KEY]);
  return <div className='map' ref={mapRef} />;
}
