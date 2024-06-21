import React, { useEffect } from 'react';
import TopMenuBar from '../navbars/TopMenuBar';
export default function RoutoMap() {
  const mapSize = {
    width: '100%',
    height: '86vh',
  };
  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.routo.com/v2/maps/map?key=07161293-d747-4473-8d6e-50252bfd83fb';
      script.async = true;
      script.onload = () => {
        var map = new routo.maps.Map('map', {
          center: { lat: 37.507009, lng: 127.0586339 }, // Initial map center
          zoom: 18,
        });
        var marker = new routo.maps.Marker({
          position: { lat: 37.507009, lng: 127.0586339 },
          map: map,
          title: '현대 오토에버',
        });
      };
      document.body.appendChild(script);
    };
    loadScript();
    return () => {};
  }, []);
  return (
    <>
      <header>
        <TopMenuBar />
      </header>
      <main>
        <div className="flex flex-col items-center">
          <div id="map" style={mapSize}></div>
        </div>
      </main>
    </>
  );
}
