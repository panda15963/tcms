import React, { useEffect, useRef } from 'react';
import H from '@here/maps-api-for-javascript';

const HereMap = () => {
  const mapRef = useRef(null);
  const map = useRef(null);
  const platform = useRef(null);
  // const apiKey = process.env.REACT_APP_HERE_API;
  const apiKey = 'gCL3ZwexchPxY4iXqsKMUUGutgkzHGgBdCeG2oN8_uc'

  useEffect(
    () => {
      // Check if the map object has already been created
      if (!map.current) {
        // Create a platform object with the API key
        platform.current = new H.service.Platform({ apiKey });
        // Create a new Raster Tile service instance
        const rasterTileService = platform.current.getRasterTileService({
          queryParams: {
            style: 'explore.day',
            size: 512,
          },
        });
        // Creates a new instance of the H.service.rasterTile.Provider class
        // The class provides raster tiles for a given tile layer ID and pixel format
        const rasterTileProvider = new H.service.rasterTile.Provider(
          rasterTileService,
        );
        // Create a new Tile layer with the Raster Tile provider
        const rasterTileLayer = new H.map.layer.TileLayer(rasterTileProvider);
        // Create a new map instance with the Tile layer, center and zoom level
        const newMap = new H.Map(mapRef.current, rasterTileLayer, {
          pixelRatio: window.devicePixelRatio,
          center: {
            lat: 64.144,
            lng: -21.94,
          },
          zoom: 14,
        });

        // Add panning and zooming behavior to the map
        const behavior = new H.mapevents.Behavior(
          new H.mapevents.MapEvents(newMap),
        );

        // Set the map object to the reference
        map.current = newMap;
      }
    },
    // Dependencies array
    [apiKey],
  );

  // Return a div element to hold the map
  return <div style={{ width: '100%', height: '350px' }} ref={mapRef} />;
};

export default HereMap;
