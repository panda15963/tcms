import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

  if (lat !== undefined && lng !== undefined) {

    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  } else {
    return { lat: defaultLat, lng: defaultLng };
  }
}

export default function BaiduMap({ lat, lng }) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);

  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  useEffect(() => {
    const loadBaiduMap = () => {
      if (!window.BMapGL) {
        const script = document.createElement('script');
        script.src =
          'https://api.map.baidu.com/api?v=3.0&type=webgl&ak=' +
          process.env.REACT_APP_BAIDU_MAP_API;
        script.onload = () => {
          const mapInstance = new window.BMapGL.Map('allmap');
          const point = new window.BMapGL.Point(center.lng, center.lat);
          mapInstance.centerAndZoom(point, Number(process.env.REACT_APP_ZOOM));
          mapInstance.enableScrollWheelZoom(true);
          const marker = new window.BMapGL.Marker(point);
          mapInstance.addOverlay(marker);

          mapRef.current = { mapInstance, marker };
        };
        document.head.appendChild(script);
      } else {
        const mapInstance = new window.BMapGL.Map('allmap');
        const point = new window.BMapGL.Point(center.lng, center.lat);
        mapInstance.centerAndZoom(point, Number(process.env.REACT_APP_ZOOM));
        mapInstance.enableScrollWheelZoom(true);
        const marker = new window.BMapGL.Marker(point);
        mapInstance.addOverlay(marker);

        mapRef.current = { mapInstance, marker };
      }
    };

    loadBaiduMap();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const { mapInstance, marker } = mapRef.current;
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapInstance.centerAndZoom(point, Number(process.env.REACT_APP_ZOOM));
      marker.setPosition(point);
    }
  }, [center]);

  return (
    <div>
      <div id="allmap" className="map"></div>
    </div>
  );
}
