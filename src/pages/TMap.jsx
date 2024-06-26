import { useEffect } from 'react';

export default function TMap() {
  const { Tmapv2 } = window;

  useEffect(() => {
    initMap();
  }, []);

  function initMap() {
    new window.Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(37.566481622437934, 126.98502302169841), // 지도 초기 좌표
      height: `calc(100vh - 130px)`,
      zoom: 10,
    });
  }

  return (
    <>
      <main>
        <div id="map_div" style={{ overflow: 'hidden' }}></div>
      </main>
    </>
  );
}