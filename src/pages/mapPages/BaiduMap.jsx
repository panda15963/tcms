import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css';

/**
 * 지도 중심 좌표와 마커 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 위도와 경도를 포함한 객체
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = process.env.REACT_APP_LATITUDE
    ? parseFloat(process.env.REACT_APP_LATITUDE)
    : 37.5665; // Fallback latitude
  const defaultLng = process.env.REACT_APP_LONGITUDE
    ? parseFloat(process.env.REACT_APP_LONGITUDE)
    : 126.978; // Fallback longitude

  if (!isNaN(lat) && !isNaN(lng)) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  } else {
    return { lat: defaultLat, lng: defaultLng };
  }
}

/**
 * 지도 중심 좌표와 마커 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 위도와 경도를 포함한 객체
 */
function parseCoordinates(coords) {
  if (!coords) return [];
  if (typeof coords === 'string') {
    const [lng, lat] = coords.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return [];
    return [{ lat, lng }];
  } else if (Array.isArray(coords)) {
    return coords
      .map((coord) => {
        const [lng, lat] = coord.split(',').map(Number);
        if (isNaN(lat) || isNaN(lng)) return null;
        return { lat, lng };
      })
      .filter(Boolean);
  }
  return [];
}

/**
 * BaiduMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function BaiduMap({
  lat,
  lng,
  locationCoords = () => {},
  origins,
  destinations,
  checkedNodes,
  clickedNode,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // Calculate initial map center
  const [center, setCenter] = useState(initialCoords); // Manage center state
  const mapRef = useRef({ mapInstance: null, marker: null, driving: null }); // Store map, marker, and driving route instance

  console.log('checkedNodes ==>', checkedNodes);
  // Update center when lat or lng changes
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  const addRoute = () => {
    const originCoords = parseCoordinates(origins);
    const destinationCoords = parseCoordinates(destinations);

    // Check if coordinates are valid
    if (originCoords.length > 0 && destinationCoords.length > 0) {
      const start = new window.BMapGL.Point(
        originCoords[0].lng,
        originCoords[0].lat,
      );
      const end = new window.BMapGL.Point(
        destinationCoords[0].lng,
        destinationCoords[0].lat,
      );

      // Clear the previous route before adding a new one
      if (mapRef.current.driving) {
        mapRef.current.driving.clearResults();
      }

      // Create a new DrivingRoute instance
      const driving = new window.BMapGL.DrivingRoute(
        mapRef.current.mapInstance,
        {
          renderOptions: {
            map: mapRef.current.mapInstance,
            autoViewport: true,
          },
          onSearchComplete: function (results) {
            if (driving.getStatus() === window.BMAP_STATUS_SUCCESS) {
              console.log('Route search successful!');

              // Extract the polyline from the results
              const plan = results.getPlan(0);
              if (plan) {
                const route = plan.getRoute(0);
                const polyline = route.getPolyline();
                if (polyline) {
                  const path = polyline.getPath();
                  const distance = Math.round(polyline.getDistance());

                  // Log the distance and path of the polyline
                  console.log('Distance:', distance, 'meters');
                  console.log('Path:', path);
                }
              }
            } else {
              console.error(
                'Route search failed with status:',
                driving.getStatus(),
              );
            }
          },
        },
      );

      // Perform the search with the start and end points
      driving.search(start, end);

      console.log(start, end);

      // Save the `driving` instance to `mapRef`
      mapRef.current.driving = driving;
    } else {
      console.error('Invalid coordinates for route');
    }
  };

  // Initialize Baidu Map and add a route
  useEffect(() => {
    let marker;

    /**
     * Baidu 지도 API를 로드하는 함수
     */
    const loadBaiduMap = () => {
      if (!window.BMapGL) {
        const script = document.createElement('script');
        script.src = `https://api.map.baidu.com/api?v=3.0&type=webgl&ak=${process.env.REACT_APP_BAIDU_MAP_API}`;
        script.onload = initializeMap;
        script.onerror = () => {
          console.error('Failed to load Baidu Map API');
        };
        document.head.appendChild(script);
      } else {
        initializeMap(); // Initialize if API is already loaded
      }
    };

    /**
     * 지도를 초기화하는 함수
     */
    const initializeMap = () => {
      const mapInstance = new window.BMapGL.Map('allmap');
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14),
      );
      mapInstance.enableScrollWheelZoom(true);
      marker = new window.BMapGL.Marker(point);
      mapInstance.addOverlay(marker);

      // Wait for map tiles to load before adding route
      mapInstance.addEventListener('tilesloaded', () => {
        mapRef.current.mapInstance = mapInstance;
        mapRef.current.marker = marker;
        addRoute(); // Add route after tiles load
      });

      mapInstance.addEventListener('click', (event) => {
        const clickedPoint = event.latlng || event.latLng;
        if (clickedPoint) {
          const clickedLat = clickedPoint.lat;
          const clickedLng = clickedPoint.lng;
          locationCoords({ lat: clickedLat, lng: clickedLng });
        }
      });
    };

    loadBaiduMap(); // Load Baidu map

    // Cleanup Baidu map and event listeners when component unmounts
    return () => {
      if (mapRef.current.mapInstance) {
        mapRef.current.mapInstance.removeEventListener('click');
        mapRef.current.mapInstance.removeEventListener('tilesloaded');
        mapRef.current.mapInstance.clearOverlays();
      }
    };
  }, [center]);

  // Update the map and marker when the center changes
  useEffect(() => {
    if (mapRef.current.mapInstance) {
      const { mapInstance, marker } = mapRef.current;
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14),
      );
      marker.setPosition(point);
    }
  }, [center]);

  // Add route whenever origins or destinations change
  useEffect(() => {
    if (origins && destinations) {
      addRoute();
    }
  }, [origins, destinations]);
  {
    /* 지도 표시 영역 */
  }
  return <div id="allmap" className="map" />;
}
