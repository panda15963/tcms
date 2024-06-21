import React, { useEffect, useRef } from 'react';
import TopMenuBar from '../navbars/TopMenuBar';
import H from '@here/maps-api-for-javascript';

const Map = ({ apikey }) => {
  const mapRef = useRef(null);
  const map = useRef(null);
  const platform = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
      if (!map.current) {
        platform.current = new H.service.Platform({
          apikey,
          container: mapRef.current
        });

        const defaultLayers = platform.current.createDefaultLayers({
          pois: true,
        });

        const newMap = new H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            zoom: 14,
            center: { lat: 64.144, lng: -21.94 },
          },
        );

        new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap));

        map.current = newMap;
      }
    };

    initializeMap();
  }, [apikey]);

  // Return a div element to hold the map
  return <div style={{ width: '100%', height: '86vh' }} ref={mapRef} />;
};

export default function HereMap() {
  const apikey = 'gCL3ZwexchPxY4iXqsKMUUGutgkzHGgBdCeG2oN8_uc';
  return (
    <>
      <header>
        <TopMenuBar />
      </header>
      <main>
        <Map apikey={apikey} />
      </main>
    </>
  );
}
