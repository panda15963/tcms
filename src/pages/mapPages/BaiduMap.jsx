import { useEffect } from 'react';
import '../../style/MapStyle.css';

export default function BaiduMap() {
  useEffect(() => {
    const loadBaiduMap = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.map.baidu.com/api?v=3.0&type=webgl&ak=' + process.env.REACT_APP_BAIDU_MAP_API;
      script.onload = () => {
        const map = new window.BMapGL.Map('allmap');
        map.centerAndZoom(new window.BMapGL.Point(Number(process.env.REACT_APP_LONGITUDE), Number(process.env.REACT_APP_LATITUDE)), Number(process.env.REACT_APP_ZOOM));
        map.enableScrollWheelZoom(true);
        map.setHeading(64.5);
        map.setTilt(73);
      };
      document.head.appendChild(script);
    };

    loadBaiduMap();
  }, []);

  return <div id="allmap" className="map"></div>;
};