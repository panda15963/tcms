import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css';

/**
 * 지도 중심 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 지도 중심 좌표 (위도와 경도 포함)
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

  return {
    lat: lat !== undefined ? parseFloat(lat) : defaultLat,
    lng: lng !== undefined ? parseFloat(lng) : defaultLng,
  };
}

/**
 * 좌표 배열의 경계를 계산하는 함수
 * @param {Array} coordsArray - 좌표 배열
 * @returns {Object} - LatLngBounds 객체
 */
function calculateBounds(coordsArray) {
  const bounds = new window.google.maps.LatLngBounds();
  coordsArray.forEach((coord) => {
    bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
  });
  return bounds;
}

/**
 * GoogleMap 컴포넌트
 * @param {Object} props
 * @param {number} lat - 초기 지도 중심 위도 값
 * @param {number} lng - 초기 지도 중심 경도 값
 * @param {function} locationCoords - 지도 클릭 시 좌표를 부모로 전달하는 콜백
 * @param {Array} routeFullCoords - 경로를 나타내는 좌표 배열
 * @param {Object} clickedNode - 클릭된 노드 데이터
 * @param {function} error - 오류 메시지 콜백
 * @param {function} routeColors - 경로 색상을 업데이트하는 콜백
 * @param {Array} spaceFullCoords - 공간 데이터를 나타내는 좌표 배열
 */
export default function GoogleMap({
  lat,
  lng,
  locationCoords = () => {}, // Callback function to pass coordinates
  routeFullCoords, // Contains coords for polyline
  clickedNode, // Selected route to center the map on
  error = () => {},
  routeColors = () => {}, // Callback function to pass route colors
  spaceFullCoords,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [map, setMap] = useState(null); // 지도 인스턴스 상태 관리
  const mapRef = useRef(null); // 지도 DOM 참조
  const spaceMarkerRefs = useRef([]); // 공간 마커 참조 배열
  const spacePolylinesRef = useRef([]); // 공간 폴리라인 참조 배열
  const routeMarkerRefs = useRef([]); // 경로 마커 참조 배열
  const routePolylinesRef = useRef([]); // 경로 폴리라인 참조 배열
  const markerRefs = useRef([]); // 일반 마커 참조 배열
  const initialMarkerRef = useRef(null); // 초기 마커 참조
  const { t } = useTranslation(); // 다국어 번역 훅
  const [previousRouteCoords, setPreviousRouteCoords] = useState([]);
  const [adjustedRouteCoords, setAdjustedRouteCoords] = useState([]);
  const [previousSpaceCoords, setPreviousSpaceCoords] = useState([]);
  const [adjustedSpaceCoords, setAdjustedSpaceCoords] = useState([]);

  // Memoize the callback functions
  const memoizedLocationCoords = useCallback(locationCoords, []);

  // 마커 및 폴리라인 정리 함수
  const clearSpacePolylines = () => {
    spacePolylinesRef.current.forEach((polyline) => polyline.setMap(null));
    spacePolylinesRef.current = [];
  };

  const clearSpaceMarkers = () => {
    spaceMarkerRefs.current.forEach((marker) => marker.setMap(null));
    spaceMarkerRefs.current = [];
  };

  const clearRoutePolylines = () => {
    routePolylinesRef.current.forEach((polyline) => polyline.setMap(null));
    routePolylinesRef.current = [];
  };

  const clearRouteMarkers = () => {
    routeMarkerRefs.current.forEach((marker) => marker.setMap(null));
    routeMarkerRefs.current = [];
  };

  const clearMarkers = () => {
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
  };

  // 지도 초기화 및 마커 추가
  useEffect(() => {
    if (!window.google) {
      error(t('GoogleMap.APIError'));
      return;
    }

    if (!map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: Number(process.env.REACT_APP_ZOOM) || 10,
        center: initialCoords,
        mapTypeControl: true,
      });

      setMap(mapInstance);

      // 초기 마커 추가
      const initialMarker = new window.google.maps.Marker({
        position: initialCoords,
        map: mapInstance,
      });
      initialMarkerRef.current = initialMarker;
      markerRefs.current.push(initialMarker);

      // 지도 클릭 이벤트 리스너 추가
      mapInstance.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        locationCoords({ lat: clickedLat, lng: clickedLng });
      });
    }
  }, [map, initialCoords, t, error, memoizedLocationCoords]);

  // 지도 중심 업데이트
  useEffect(() => {
    if (map) {
      const newCenter = calculateCenterAndMarker(lat, lng);
      const isDefaultLocation =
        newCenter.lat === parseFloat(process.env.REACT_APP_LATITUDE) &&
        newCenter.lng === parseFloat(process.env.REACT_APP_LONGITUDE);

      if (
        newCenter.lat !== map.getCenter().lat() ||
        newCenter.lng !== map.getCenter().lng()
      ) {
        map.setCenter(newCenter);
      }

      // 기본 위치에서는 마커 제거
      if (isDefaultLocation) {
        clearMarkers();
      } else {
        clearMarkers();

        // 새로운 마커 추가
        const marker = new window.google.maps.Marker({
          position: newCenter,
          map: map,
        });
        markerRefs.current.push(marker);
      }
    }
  }, [lat, lng, map]);

  const findRemovedSpaceIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id
      );
      if (isRouteRemoved) {
        return i;
      }
    }
    return -1;
  };

  useEffect(() => {
    if (
      previousSpaceCoords.length > 0 && // 이전 공간 좌표가 존재하는지 확인
      previousSpaceCoords.length > spaceFullCoords.length // 이전 좌표보다 현재 좌표가 적은지 확인 (삭제 여부)
    ) {
      const removedIndex = findRemovedSpaceIndex(
        previousSpaceCoords, // 이전 공간 좌표
        spaceFullCoords // 현재 공간 좌표
      );

      if (removedIndex !== -1) {
        const newAdjustedCoords = [...previousSpaceCoords]; // 이전 공간 좌표 복사
        newAdjustedCoords[removedIndex] = null; // 제거된 위치를 null로 설정
        setAdjustedSpaceCoords(newAdjustedCoords); // 조정된 좌표 상태 업데이트
      }
    } else {
      setAdjustedSpaceCoords(spaceFullCoords); // 조정된 공간 좌표를 현재 공간 좌표로 설정
    }

    setPreviousSpaceCoords(spaceFullCoords); // 이전 공간 좌표 상태를 현재 값으로 업데이트
  }, [spaceFullCoords]); // spaceFullCoords가 변경될 때마다 실행

  // 공간 데이터 표시
  useEffect(() => {
    if (!map) return; // 지도 인스턴스가 없으면 종료

    // 이전에 그려진 공간 경로 및 마커 제거
    clearSpacePolylines();
    clearSpaceMarkers();

    const spaceCoords = []; // 공간 좌표를 저장할 배열
    const spaceMarkers = []; // 공간 마커를 저장할 배열

    adjustedSpaceCoords.forEach((space, index) => {
      if (space && space.coords && space.coords.length > 0) {
        // 공간 데이터가 유효한지 확인
        spaceCoords.push(...space.coords); // 공간의 모든 좌표를 추가

        // 시작 및 종료 마커 생성
        const startMarker = calculateCenterAndMarker(
          space.coords[0].lat,
          space.coords[0].lng
        );
        const goalMarker = calculateCenterAndMarker(
          space.coords[space.coords.length - 1].lat,
          space.coords[space.coords.length - 1].lng
        );

        spaceMarkers.push(startMarker, goalMarker); // 마커 좌표 추가

        // 폴리라인 경로 설정
        const polylinePath = space.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        // 현재 인덱스에 따라 폴리라인 색상 선택
        const polylineColor = routeColors[index % routeColors.length];

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: polylineColor,
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });

        polyline.setMap(map); // 지도에 폴리라인 추가
        spacePolylinesRef.current.push(polyline); // 폴리라인 참조 저장
      }
    });

    if (spaceCoords.length > 0) {
      // 공간 마커를 지도에 추가
      spaceMarkers.forEach((marker, index) => {
        const spaceMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
          icon: index % 2 === 0 ? Start_Point : End_Point, // 시작/종료 아이콘
        });
        spaceMarkerRefs.current.push(spaceMarker); // 마커 참조 저장
      });

      // 공간의 좌표에 맞게 지도 범위 설정
      const bounds = calculateBounds(spaceCoords);
      map.fitBounds(bounds);
    }
  }, [adjustedSpaceCoords, map, routeColors]); // 의존성 배열: adjustedSpaceCoords, map, routeColors

  // 이전 경로 데이터와 현재 경로 데이터 비교하여 제거된 경로의 인덱스를 찾는 함수
  const findRemovedRouteIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id
      );
      if (isRouteRemoved) {
        return i; // 제거된 경로의 인덱스 반환
      }
    }
    return -1; // 제거된 경로가 없으면 -1 반환
  };

  // 경로가 제거되었는지 감지하고 adjustedRouteCoords를 업데이트하는 useEffect
  useEffect(() => {
    if (
      previousRouteCoords.length > 0 &&
      previousRouteCoords.length > routeFullCoords.length
    ) {
      const removedIndex = findRemovedRouteIndex(
        previousRouteCoords,
        routeFullCoords
      );
      if (removedIndex !== -1) {
        // 제거된 인덱스를 null로 설정하여 새 배열 생성
        const newAdjustedCoords = [...previousRouteCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedRouteCoords(newAdjustedCoords); // 업데이트된 경로 설정
      }
    } else {
      // 경로가 제거되지 않은 경우 adjustedRouteCoords를 routeFullCoords와 동기화
      setAdjustedRouteCoords(routeFullCoords);
    }

    setPreviousRouteCoords(routeFullCoords); // 이전 경로 상태 업데이트
  }, [routeFullCoords]); // 의존성 배열: routeFullCoords

  // routeFullCoords를 지도에 그리는 useEffect
  useEffect(() => {
    if (!map) {
      console.warn('Map instance is not initialized'); // 지도 인스턴스가 없을 때 경고
      return;
    }

    if (!routeFullCoords || routeFullCoords.length === 0) {
      console.warn('No routeFullCoords available'); // 경로 데이터가 없을 때 경고
      return;
    }

    // 이전 경로 폴리라인 및 마커 제거
    clearRoutePolylines();
    clearRouteMarkers();

    const routeCoords = []; // 경로 좌표 저장
    const routeMarkers = []; // 경로 마커 저장

    adjustedRouteCoords.forEach((route, index) => {
      if (route && route.coords && route.coords.length > 0) {
        routeCoords.push(...route.coords); // 경로 좌표 추가

        // 시작 및 종료 마커 생성
        const startMarker = calculateCenterAndMarker(
          route.coords[0].lat,
          route.coords[0].lng
        );
        const goalMarker = calculateCenterAndMarker(
          route.coords[route.coords.length - 1].lat,
          route.coords[route.coords.length - 1].lng
        );

        routeMarkers.push(startMarker, goalMarker); // 마커 좌표 추가

        // 폴리라인 경로 설정
        const polylinePath = route.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        const polylineColor = routeColors[index % routeColors.length]; // 색상 선택

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: polylineColor,
          strokeOpacity: 0.8,
          strokeWeight: 5,
        });

        polyline.setMap(map); // 지도에 폴리라인 추가
        routePolylinesRef.current.push(polyline); // 폴리라인 참조 저장
      }
    });

    if (routeCoords.length > 0) {
      // 경로 마커를 지도에 추가
      routeMarkers.forEach((marker, index) => {
        const routeMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
          icon: index % 2 === 0 ? Start_Point : End_Point, // 시작/종료 아이콘
        });
        routeMarkerRefs.current.push(routeMarker); // 마커 참조 저장
      });

      // 경로 좌표에 맞게 지도 범위 설정
      const bounds = calculateBounds(routeCoords);
      map.fitBounds(bounds);
    }
  }, [adjustedRouteCoords, map, routeColors]); // 의존성 배열: adjustedRouteCoords, map, routeColors

  // clickedNode 변경 시 지도의 중심을 업데이트하는 useEffect
  useEffect(() => {
    if (
      !map ||
      !clickedNode ||
      !clickedNode.start_coord ||
      !clickedNode.goal_coord
    )
      return;

    const startCoord = clickedNode.start_coord.split(',').map(Number); // 시작 좌표
    const goalCoord = clickedNode.goal_coord.split(',').map(Number); // 종료 좌표
    const routeCoords = [
      { lat: startCoord[1], lng: startCoord[0] },
      { lat: goalCoord[1], lng: goalCoord[0] },
    ];

    const bounds = calculateBounds(routeCoords); // 경로에 맞게 지도 범위 계산
    map.fitBounds(bounds); // 지도 범위 설정
  }, [clickedNode, map]); // 의존성 배열: clickedNode, map

  return <div ref={mapRef} style={{ height: '87.8vh' }} />;
}
