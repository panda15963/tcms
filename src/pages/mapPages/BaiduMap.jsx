import { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg';
import Start_Point from '../../assets/images/multi_start_point.svg';
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
  // coords가 존재하지 않을 경우 빈 배열 반환
  if (!coords) return [];

  // coords가 문자열일 경우
  if (typeof coords === 'string') {
    // 문자열을 ','로 분리하여 lng(경도)와 lat(위도)로 변환
    const [lng, lat] = coords.split(',').map(Number);
    // lat 또는 lng가 숫자가 아닐 경우 빈 배열 반환
    if (isNaN(lat) || isNaN(lng)) return [];
    // lat과 lng 객체로 반환
    return [{ lat, lng }];
  }

  // coords가 { lng, lat } 객체의 배열일 경우
  if (Array.isArray(coords) && typeof coords[0] === 'object') {
    return (
      coords
        .map(({ lng, lat }) => {
          // lat 또는 lng가 숫자가 아닐 경우 null 반환
          if (isNaN(lat) || isNaN(lng)) return null;
          // lat과 lng 객체로 반환
          return { lat, lng };
        })
        // null 값을 제거하고 유효한 객체만 반환
        .filter(Boolean)
    );
  }

  // coords가 문자열 배열일 경우
  if (Array.isArray(coords)) {
    return (
      coords
        .map((coord) => {
          // 문자열을 ','로 분리하여 lng(경도)와 lat(위도)로 변환
          const [lng, lat] = coord.split(',').map(Number);
          // lat 또는 lng가 숫자가 아닐 경우 null 반환
          if (isNaN(lat) || isNaN(lng)) return null;
          // lat과 lng 객체로 반환
          return { lat, lng };
        })
        // null 값을 제거하고 유효한 객체만 반환
        .filter(Boolean)
    );
  }

  // 위 조건에 해당하지 않을 경우 빈 배열 반환
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
 * @param {Array} routeFullCoords - 전체 경로 좌표 배열
 * @param {Array} spaceFullCoords - 전체 공간 좌표 배열
 * @param {function} routesColors - 경로 색상을 반환하는 함수
 * @param {function} onClearMap - 지도 초기화 함수
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
  spaceFullCoords = [],
  routesColors = () => {},
  onClearMap,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 상태 관리
  const mapRef = useRef({ mapInstance: null, marker: null, driving: null }); // 지도, 마커, 경로 인스턴스 저장
  const routeColors = useRef(new Map());

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
  // 경로 검색 경로 그리기기
  const drawRouteFullCoordsRoutes = (routeFullCoords, checkedNodes) => {
    // 지도 인스턴스가 존재하지 않거나 routeFullCoords가 없으면 함수 종료
    if (!mapRef.current.mapInstance || !routeFullCoords) return;

    // 이전에 추가된 오버레이를 제거
    mapRef.current.overlays = mapRef.current.overlays || [];
    mapRef.current.overlays.forEach((overlay) =>
      mapRef.current.mapInstance.removeOverlay(overlay)
    );
    mapRef.current.overlays = [];

    let allCoords = []; // 중심 좌표 계산을 위한 모든 좌표 저장
    const filteredRoutes = routeFullCoords.filter((route) =>
      checkedNodes.some((node) => node.file_id === route.file_id)
    );

    console.log(routeFullCoords);

    // 새 경로 추가
    filteredRoutes.forEach((route, index) => {
      const coords = parseCoordinates(route.coords); // { lat, lng } 객체로 변환
      if (coords.length > 1) {
        allCoords.push(...coords); // 좌표 수집

        const points = coords.map(
          (coord) => new window.BMapGL.Point(coord.lng, coord.lat)
        );

        // 색상 선택 (이미 지정된 색상 또는 기본 색상 중 하나 사용)
        const color =
          routeColors.current.get(route.file_id) ||
          routesColors[index % routesColors.length];
        routeColors.current.set(route.file_id, color);

        // Polyline(경로) 생성 및 추가
        const polyline = new window.BMapGL.Polyline(points, {
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.8,
        });

        mapRef.current.mapInstance.addOverlay(polyline);
        mapRef.current.overlays.push(polyline);

        // 시작 지점 마커 추가
        const startPoint = points[0];
        const startIcon = new window.BMapGL.Icon(
          Start_Point,
          new window.BMapGL.Size(32, 32)
        );
        const startMarker = new window.BMapGL.Marker(startPoint, {
          icon: startIcon,
        });
        mapRef.current.mapInstance.addOverlay(startMarker);
        mapRef.current.overlays.push(startMarker);

        // 끝 지점 마커 추가
        const endPoint = points[points.length - 1];
        const endIcon = new window.BMapGL.Icon(
          End_Point,
          new window.BMapGL.Size(32, 32)
        );
        const endMarker = new window.BMapGL.Marker(endPoint, { icon: endIcon });
        mapRef.current.mapInstance.addOverlay(endMarker);
        mapRef.current.overlays.push(endMarker);
      }
    });

    // 모든 좌표의 중심 계산
    if (allCoords.length > 0) {
      const centerLat =
        allCoords.reduce((sum, coord) => sum + coord.lat, 0) / allCoords.length;
      const centerLng =
        allCoords.reduce((sum, coord) => sum + coord.lng, 0) / allCoords.length;

      // 지도 중심 좌표 설정
      const centerPoint = new window.BMapGL.Point(centerLng, centerLat);
      mapRef.current.mapInstance.centerAndZoom(centerPoint, Number(10));
    }
  };

  // 컴포넌트가 업데이트될 때 routeFullCoords와 checkedNodes 기반으로 경로 그리기
  useEffect(() => {
    drawRouteFullCoordsRoutes(routeFullCoords, checkedNodes);
  }, [routeFullCoords, routeColors, checkedNodes]);

  // 공간 검색 경로 그리기
  const drawSpaceFullCoordsRoutes = (spaceFullCoords, checkedNodes) => {
    // 지도 인스턴스가 존재하지 않거나 spaceFullCoords가 없으면 함수 종료
    if (!mapRef.current.mapInstance || !spaceFullCoords) return;

    // 이전 오버레이 제거
    mapRef.current.overlays = mapRef.current.overlays || [];
    mapRef.current.overlays.forEach((overlay) =>
      mapRef.current.mapInstance.removeOverlay(overlay)
    );
    mapRef.current.overlays = [];

    let allCoords = []; // 중심 계산을 위한 좌표 저장
    const filteredRoutes = spaceFullCoords.filter((route) =>
      checkedNodes.some((node) => node.file_id === route.file_id)
    );

    // 새 경로 추가
    filteredRoutes.forEach((route, index) => {
      const coords = parseCoordinates(route.coords); // { lat, lng } 객체로 변환
      if (coords.length > 1) {
        allCoords.push(...coords); // 좌표 저장

        const points = coords.map(
          (coord) => new window.BMapGL.Point(coord.lng, coord.lat)
        );

        // 색상 설정
        const color =
          routeColors.current.get(route.file_id) ||
          routesColors[index % routesColors.length];
        routeColors.current.set(route.file_id, color);

        // Polyline(경로) 생성 및 추가
        const polyline = new window.BMapGL.Polyline(points, {
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.8,
        });

        mapRef.current.mapInstance.addOverlay(polyline);
        mapRef.current.overlays.push(polyline);

        // 시작 마커 추가
        const startPoint = points[0];
        const startIcon = new window.BMapGL.Icon(
          Start_Point,
          new window.BMapGL.Size(32, 32)
        );
        const startMarker = new window.BMapGL.Marker(startPoint, {
          icon: startIcon,
        });
        mapRef.current.mapInstance.addOverlay(startMarker);
        mapRef.current.overlays.push(startMarker);

        // 끝 마커 추가
        const endPoint = points[points.length - 1];
        const endIcon = new window.BMapGL.Icon(
          End_Point,
          new window.BMapGL.Size(32, 32)
        );
        const endMarker = new window.BMapGL.Marker(endPoint, { icon: endIcon });
        mapRef.current.mapInstance.addOverlay(endMarker);
        mapRef.current.overlays.push(endMarker);
      }
    });

    // 중심 계산
    if (allCoords.length > 0) {
      const centerLat =
        allCoords.reduce((sum, coord) => sum + coord.lat, 0) / allCoords.length;
      const centerLng =
        allCoords.reduce((sum, coord) => sum + coord.lng, 0) / allCoords.length;

      // 지도 중심 설정
      const centerPoint = new window.BMapGL.Point(centerLng, centerLat);
      mapRef.current.mapInstance.centerAndZoom(centerPoint, Number(13));
    }
  };

  // 컴포넌트가 업데이트될 때 spaceFullCoords와 checkedNodes 기반으로 경로 그리기
  useEffect(() => {
    drawSpaceFullCoordsRoutes(spaceFullCoords, checkedNodes);
  }, [spaceFullCoords, routeColors, checkedNodes]);

  // checkedNodes 변경 시 지도 업데이트
  useEffect(() => {
    if (!mapRef.current.mapInstance) return;

    if (checkedNodes.length === 0) {
      // 모든 오버레이 제거
      mapRef.current.overlays = mapRef.current.overlays || [];
      mapRef.current.overlays.forEach((overlay) =>
        mapRef.current.mapInstance.removeOverlay(overlay)
      );
      mapRef.current.overlays = [];

      // 초기 중심 좌표로 지도 설정
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapRef.current.mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14)
      );
    } else {
      // 경로 또는 공간 기반으로 지도 그리기
      drawRouteFullCoordsRoutes(routeFullCoords, checkedNodes);
      drawSpaceFullCoordsRoutes(spaceFullCoords, checkedNodes);
    }
  }, [checkedNodes, routeFullCoords, spaceFullCoords]);

  // 클릭한 경로 또는 공간 중심으로 지도 이동
  useEffect(() => {
    if (!clickedNode || !mapRef.current.mapInstance) return;

    const clickedRoute = routeFullCoords?.find(
      (route) => route.file_id === clickedNode.file_id
    );
    const clickedSpace = spaceFullCoords?.find(
      (space) => space.file_id === clickedNode.file_id
    );

    const clickedItem = clickedRoute || clickedSpace;

    if (!clickedItem || !clickedItem.coords) return;

    const coords = parseCoordinates(clickedItem.coords);
    if (coords.length === 0) return;

    // 중심 계산
    const centerLat =
      coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length;
    const centerLng =
      coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length;

    const centerPoint = new window.BMapGL.Point(centerLng, centerLat);
    mapRef.current.mapInstance.centerAndZoom(centerPoint, Number(14));
  }, [clickedNode, routeFullCoords, spaceFullCoords]);

  // onClearMap 값이 true일 때 지도 초기화
  useEffect(() => {
    if (onClearMap && mapRef.current.mapInstance) {
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapRef.current.mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14)
      );
    }
  }, [onClearMap]);

  /**
   * Baidu 지도 초기화 및 로드
   */
  useEffect(() => {
    let marker;

    /**
     * Baidu 지도 API를 로드하는 함수
     */
    const initializeMap = () => {
      const mapInstance = new window.BMapGL.Map('allmap');
      const point = new window.BMapGL.Point(center.lng, center.lat);
      mapInstance.centerAndZoom(
        point,
        Number(process.env.REACT_APP_ZOOM || 14)
      );
      mapInstance.enableScrollWheelZoom(true);

      // 마커를 기본 좌표가 아닌 경우에만 추가
      const isDefaultCoordinates =
        center.lat === Number(process.env.REACT_APP_LATITUDE) && center.lng === Number(process.env.REACT_APP_LONGITUDE); // 기본 서울 좌표
      if (!isDefaultCoordinates) {
        marker = new window.BMapGL.Marker(point);
        mapInstance.addOverlay(marker);
      }

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

    initializeMap(); // 이미 로드된 경우 초기화만 수행

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
    if (mapRef.current?.mapInstance && mapRef.current?.marker) {
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

  return (
    <div
      id="allmap"
      className="map"
      style={{ height: `calc(100vh - 102px)`, zIndex: '1' }}
    />
  );
}
