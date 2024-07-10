import { useEffect } from 'react';
import '../style/MapStyle.css';

export default function RoutoMap() {
  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.routo.com/v2/maps/map?key=' +
        process.env.REACT_APP_ROUTTO_MAP_API;
      script.async = true;
      script.onload = () => {
        var map = new routo.maps.Map('map', {
          center: { lat: Number(process.env.REACT_APP_LATITUDE), lng: Number(process.env.REACT_APP_LONGITUDE) },
          zoom: Number(process.env.REACT_APP_ZOOM),
        });
        new routo.maps.Marker({
          position: { lat: Number(process.env.REACT_APP_LATITUDE), lng: Number(process.env.REACT_APP_LONGITUDE) },
          map: map,
          title: '현대 오토에버',
        });
      };
      document.body.appendChild(script);
    };
    loadScript();
    return () => {};
  }, []);
  return <div id='map' className='map'></div>;
}
