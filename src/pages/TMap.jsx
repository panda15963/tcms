import { useEffect, useState } from 'react';
import '../style/MapStyle.css';

export default function TMap({ lat, lng }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  console.log(lat, lng)

  useEffect(() => {
    const { Tmapv2 } = window;
    if (Tmapv2 && !mapLoaded) {
      initMap(Tmapv2);
      setMapLoaded(true);
    }
  }, [mapLoaded]);

  function initMap(Tmapv2) {
    const map = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(
        Number(process.env.REACT_APP_LATITUDE),
        Number(process.env.REACT_APP_LONGITUDE),
      ),
      zoom: Number(process.env.REACT_APP_ZOOM),
    });
    new Tmapv2.Marker({
      position: new Tmapv2.LatLng(
        Number(process.env.REACT_APP_LATITUDE),
        Number(process.env.REACT_APP_LONGITUDE),
      ),
      map: map,
      title: '현대 오토에버',
    });
  }

  return (
    <>
      <main>
        <div id="map_div" className="map"></div>
      </main>
    </>
  );
}
