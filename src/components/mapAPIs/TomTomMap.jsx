import TopMenuBar from '../navbars/TopMenuBar';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import React, { useEffect } from 'react';

export default function TomTomMap() {
    const longitude = '-121.91599'
    const latitude = '37.36765'
    useEffect(() => {
        // Initialize map
        const map = tt.map({
          key: '1qMV5vCZD3v9R26wCeA2hOMq73DcaPAM',
          container: 'map-container',
          center: [longitude, latitude], 
          zoom: 15,
        });
    
        // Add a marker to the map
        const marker = new tt.Marker().setLngLat([longitude, latitude]).addTo(map);
    
        return () => map.remove(); // Clean up
      }, []);

  return (
    <div>
      <TopMenuBar />
      <div id="map-container" className="w-full h-screen"></div>
    </div>
  );
}
