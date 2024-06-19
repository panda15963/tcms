import { useEffect, useRef, useState } from 'react';
import TopMenuBar from '../navbar/TopMenuBar';

export default function TMap() {
  const mapElement = useRef(null);
  const { Tmapv2 } = window;
  //   const [isScriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    initMap();
  }, []);

  function initMap() {
    const map = new window.Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(37.566481622437934, 126.98502302169841), // 지도 초기 좌표
      height: `calc(100vh - 130px)`,
      zoom: 10,
    });
  }

  return (
    <>
      <header>
        <TopMenuBar />
      </header>
      <main>
        <div id="map_div" style={{ overflow: 'hidden' }}></div>
      </main>
    </>
  );
}
