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
    : 37.5665; // 기본 위도 (서울)
  const defaultLng = process.env.REACT_APP_LONGITUDE
    ? parseFloat(process.env.REACT_APP_LONGITUDE)
    : 126.978; // 기본 경도 (서울)

  if (!isNaN(lat) && !isNaN(lng)) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  } else {
    return { lat: defaultLat, lng: defaultLng };
  }
}

/**
 * 좌표 문자열을 파싱하여 좌표 배열로 변환
 * @param {string | Array<string>} coords - 좌표 문자열 또는 문자열 배열
 * @returns {Array<Object>} - 파싱된 좌표 객체 배열
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
 * @param {Object} props - 컴포넌트 프로퍼티
 * @param {number} lat - 지도 초기 위도 값
 * @param {number} lng - 지도 초기 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모 컴포넌트로 전달하는 함수
 * @param {string} origins - 출발지 좌표 문자열
 * @param {string} destinations - 도착지 좌표 문자열
 * @param {Array} checkedNodes - 체크된 노드 배열
 * @param {Object} clickedNode - 클릭된 노드 객체
 * @param {String} selectedAPI - 선택된 API 키
 */
export default function BaiduMap({
  lat,
  lng,
  locationCoords = () => {},
  origins,
  destinations,
  checkedNodes,
  clickedNode,
  selectedAPI,
  routeFullCoords,
  spaceFullCoords,
  routeColors = () => {},
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 상태 관리
  const mapRef = useRef({ mapInstance: null, marker: null, driving: null }); // 지도, 마커, 경로 인스턴스 저장

  // lat 또는 lng 변경 시 중심 좌표 업데이트
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  /**
   * 경로를 지도에 추가하는 함수
   */
  const addRoute = () => {
    const originCoords = parseCoordinates(origins);
    const destinationCoords = parseCoordinates(destinations);

    if (originCoords.length > 0 && destinationCoords.length > 0) {
      const start = new window.BMapGL.Point(
        originCoords[0].lng,
        originCoords[0].lat
      );
      const end = new window.BMapGL.Point(
        destinationCoords[0].lng,
        destinationCoords[0].lat
      );

      if (mapRef.current.driving) {
        mapRef.current.driving.clearResults();
      }

      const driving = new window.BMapGL.DrivingRoute(
        mapRef.current.mapInstance,
        {
          renderOptions: {
            map: mapRef.current.mapInstance,
            autoViewport: true,
          },
          onSearchComplete: function (results) {
            if (driving.getStatus() === window.BMAP_STATUS_SUCCESS) {
              const plan = results.getPlan(0);
              if (plan) {
                const route = plan.getRoute(0);
                const polyline = route.getPolyline();
                if (polyline) {
                  const distance = Math.round(polyline.getDistance());
                  console.log('Route Distance:', distance);
                }
              }
            } else {
              console.error(
                'Route search failed with status:',
                driving.getStatus()
              );
            }
          },
        }
      );

      driving.search(start, end);
      mapRef.current.driving = driving;
    } else {
      console.error('Invalid coordinates for route');
    }
  };

  /**
   * Baidu 지도 초기화 및 로드
   */
  useEffect(() => {
    let marker;

    /**
     * Baidu 지도 API를 로드하는 함수
     */
    const loadBaiduMap = () => {
      const apiKey = selectedAPI;

      // 환경 변수 검증 (알파벳과 숫자만 허용)
      if (!apiKey || !/^[A-Za-z0-9]+$/.test(apiKey)) {
        console.error('유효하지 않거나 누락된 Baidu Map API 키입니다.');
        return;
      }

      // 스크립트 동적 로드
      if (!window.BMapGL) {
        const script = document.createElement('script');
        script.src = `https://api.map.baidu.com/api?v=3.0&type=webgl&ak=${apiKey}`;
        script.onload = initializeMap; // 성공 시 지도 초기화
        script.onerror = () =>
          console.error('Baidu Map API 로드에 실패했습니다.');
        document.head.appendChild(script);
      } else {
        initializeMap(); // 이미 로드된 경우 초기화만 수행
      }
    };

    const initializeMap = () => {
      const mapInstance = new window.BMapGL.Map('allmap');
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14)
      );
      mapInstance.enableScrollWheelZoom(true);
      marker = new window.BMapGL.Marker(point);
      mapInstance.addOverlay(marker);

      mapInstance.addEventListener('tilesloaded', () => {
        mapRef.current.mapInstance = mapInstance;
        mapRef.current.marker = marker;
        addRoute();
      });

      mapInstance.addEventListener('click', (event) => {
        const clickedPoint = event.latlng || event.latLng;
        if (clickedPoint) {
          locationCoords({ lat: clickedPoint.lat, lng: clickedPoint.lng });
        }
      });
    };

    loadBaiduMap();

    return () => {
      if (mapRef.current.mapInstance) {
        mapRef.current.mapInstance.removeEventListener('click');
        mapRef.current.mapInstance.removeEventListener('tilesloaded');
        mapRef.current.mapInstance.clearOverlays();
      }
    };
  }, [center]);

  // 지도 중심 및 마커 위치 업데이트
  useEffect(() => {
    if (mapRef.current.mapInstance) {
      const { mapInstance, marker } = mapRef.current;
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14)
      );
      marker.setPosition(point);
    }
  }, [center]);

  // 출발지와 도착지가 변경될 때 경로 업데이트
  useEffect(() => {
    if (origins && destinations) {
      addRoute();
    }
  }, [origins, destinations]);

  return <div id="allmap" className="map" style={{ height: `calc(100vh - 102px)`, zIndex: '1' }} />;
}
