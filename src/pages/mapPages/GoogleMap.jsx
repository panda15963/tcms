import React, { useEffect, useRef, useState } from 'react';
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
 * @param {boolean} onClearMap - 지도 초기화 여부
 * @param {Array} checkedNode - 선택된 노드 데이터
 */
export default function GoogleMap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords,
  clickedNode,
  error = () => {},
  routeColors = () => {},
  spaceFullCoords,
  onClearMap,
}) {
  const { t } = useTranslation(); // 다국어 번역 훅
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [map, setMap] = useState(null); // 지도 인스턴스 상태 관리
  const routesColors = useRef(new Map());
  const mapRef = useRef(null); // 지도 DOM 참조
  const spaceMarkerRefs = useRef([]); // 공간 마커 참조 배열
  const spacePolylinesRef = useRef([]); // 공간 폴리라인 참조 배열
  const routeMarkerRefs = useRef([]); // 경로 마커 참조 배열
  const routePolylinesRef = useRef([]); // 경로 폴리라인 참조 배열
  const markerRefs = useRef([]); // 일반 마커 참조 배열
  const initialMarkerRef = useRef(null); // 초기 마커 참조
  const [previousRouteCoords, setPreviousRouteCoords] = useState([]);
  const [previousSpaceCoords, setPreviousSpaceCoords] = useState([]);
  const [isClickedNodeActive, setIsClickedNodeActive] = useState(false);
  const [isClickedMap, setIsClickedMap] = useState(false);

  useEffect(() => {
    routeFullCoords = []; // 경로 좌표 배열을 빈 배열로 초기화
    spaceFullCoords = []; // 공간 좌표 배열을 빈 배열로 초기화
    routeColors = []; // 경로 색상 배열을 빈 배열로 초기화
    clickedNode = null; // 클릭된 노드 값을 null로 초기화
  }, []); // 빈 dependency 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

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

      // 지도 클릭 이벤트 리스너 추가
      mapInstance.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        setIsClickedMap(true);
        locationCoords({ lat: clickedLat, lng: clickedLng });
      });
    }
  }, [map, initialCoords, t, error]);

  // 지도 중심 업데이트
  useEffect(() => {
    if (map) {
      const defaultCoords = {
        lat: parseFloat(process.env.REACT_APP_LATITUDE),
        lng: parseFloat(process.env.REACT_APP_LONGITUDE),
      };
      const defaultZoom = parseInt(process.env.REACT_APP_ZOOM, 10) || 12;

      const calculateCenterAndMarker = (lat, lng) => ({
        lat: parseFloat(lat) || defaultCoords.lat,
        lng: parseFloat(lng) || defaultCoords.lng,
      });

      // 위도(lat)와 경도(lng)를 기반으로 새로운 중심 좌표 계산
      const newCenter = calculateCenterAndMarker(lat, lng);

      if (
        map &&
        lat !== undefined &&
        lng !== undefined &&
        !isNaN(lat) &&
        !isNaN(lng)
      ) {
        // onClearMap이 false인 경우 마커를 추가하거나 업데이트
        if (!initialMarkerRef.current) {
          initialMarkerRef.current = new window.google.maps.Marker({
            position: newCenter,
            map: map,
            title: 'Initial Marker',
          });
        } else {
          initialMarkerRef.current.setPosition(newCenter);
        }

        // 지도 중심 업데이트
        map.setCenter(newCenter);
      } else {
        // onClearMap이 true인 경우 모든 마커를 제거
        if (onClearMap) {
          // 초기 마커 제거
          if (initialMarkerRef.current) {
            initialMarkerRef.current.setMap(null); // 지도에서 제거
            initialMarkerRef.current = null; // 참조 초기화
          }

          // 추가로 markerRefs 배열의 모든 마커 제거
          markerRefs.current.forEach((marker) => {
            if (marker) {
              marker.setMap(null); // 지도에서 제거
            }
          });
          markerRefs.current = []; // 배열 초기화

          // 지도 중심을 기본값으로 재설정
          const defaultCenter = {
            lat: parseFloat(process.env.REACT_APP_LATITUDE) || 0,
            lng: parseFloat(process.env.REACT_APP_LONGITUDE) || 0,
          };
          map.setCenter(defaultCenter);
          map.setZoom(parseInt(process.env.REACT_APP_ZOOM, 10) || 12);

          return; // 이후 로직을 실행하지 않음
        }
      }

      // 경로(route)와 공간(space) 데이터가 모두 없는지 확인
      if (onClearMap === true) {
        // 지도 중심과 줌을 기본값으로 재설정
        map.setCenter(newCenter);
        map.setZoom(defaultZoom);

        // 모든 마커와 폴리라인 제거
        clearSpacePolylines(); // 공간 관련 폴리라인 제거
        clearSpaceMarkers(); // 공간 관련 마커 제거
        clearRoutePolylines(); // 경로 관련 폴리라인 제거
        clearRouteMarkers(); // 경로 관련 마커 제거
        clearMarkers(); // 기타 모든 마커 제거

        // 현재 지도 중심이 기본 위치인지 확인
        const isDefaultLocation =
          newCenter.lat === defaultCoords.lat &&
          newCenter.lng === defaultCoords.lng;

        if (!isDefaultLocation) {
          // 기본 위치가 아닐 경우, 새 마커 추가
          const marker = new window.google.maps.Marker({
            position: newCenter,
            map: map,
          });
          markerRefs.current.push(marker); // 새 마커를 markerRefs 배열에 추가
        }
      }
    }
  }, [routeFullCoords, spaceFullCoords, lat, lng, map, onClearMap]);

  // 이전 공간 데이터(prevCoords)와 현재 공간 데이터(currentCoords)를 비교하여 제거된 공간의 인덱스를 찾음
  const findRemovedSpaceIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      // 이전 경로가 현재 경로에 포함되지 않은지 확인
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id
      );
      if (isRouteRemoved) {
        return i; // 제거된 경로의 인덱스를 반환
      }
    }
    return -1; // 제거된 경로가 없으면 -1 반환
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
      }
    }

    setPreviousSpaceCoords(spaceFullCoords); // 이전 공간 좌표 상태를 현재 값으로 업데이트
  }, [spaceFullCoords]); // spaceFullCoords가 변경될 때마다 실행

  // 공간 데이터 표시
  useEffect(() => {
    if (!map) {
      return; // 지도 인스턴스가 없으면 종료
    }

    // 이전에 그려진 공간 경로 및 마커 제거
    clearSpacePolylines();
    clearSpaceMarkers();

    if (!spaceFullCoords || spaceFullCoords.length === 0) {
      return; // 공간 데이터가 없으면 종료
    }

    const spaceCoords = []; // 공간 좌표를 저장할 배열
    const spaceMarkers = []; // 공간 마커를 저장할 배열
    const bounds = new window.google.maps.LatLngBounds();

    spaceFullCoords.forEach((space, index) => {
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

        spaceMarkers.push(startMarker, goalMarker);

        // 폴리라인 경로 설정
        const polylinePath = space.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        // 현재 인덱스에 따라 폴리라인 색상 선택
        const polylineColor =
          routesColors.current.get(space.file_id) ||
          routeColors[index % routeColors.length];
        routesColors.current.set(space.file_id, polylineColor);

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: polylineColor,
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });

        polyline.setMap(map); // 지도에 폴리라인 추가
        spacePolylinesRef.current.push(polyline);

        // 지도 경계 확장
        polylinePath.forEach((coord) => {
          bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
        });
      } else {
        console.warn(`Invalid space data at index ${index}:`, space);
      }
    });

    if (spaceCoords.length > 0) {
      // 공간 마커를 지도에 추가
      spaceMarkers.forEach((marker, index) => {
        const spaceMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
          icon: index % 2 === 0 ? Start_Point : End_Point,
        });
        spaceMarkerRefs.current.push(spaceMarker);
      });

      // 공간의 좌표에 맞게 지도 범위 설정
      map.fitBounds(bounds);
    } else {
      console.warn('No valid space coordinates found.');
    }
  }, [spaceFullCoords, map, routeColors]); // 의존성 배열

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
      }
    }

    setPreviousRouteCoords(routeFullCoords); // 이전 경로 상태 업데이트
  }, [routeFullCoords]); // 의존성 배열: routeFullCoords

  // routeFullCoords를 지도에 그리는 useEffect
  const renderRoutes = (routes, bounds) => {
    clearRoutePolylines();
    clearRouteMarkers();

    routes.forEach((route, index) => {
      if (route && route.coords && route.coords.length > 0) {
        const polylinePath = route.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        const polylineColor =
          routesColors.current.get(route.file_id) ||
          routeColors[index % routeColors.length];
        routesColors.current.set(route.file_id, polylineColor);

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: polylineColor,
          strokeOpacity: 0.8,
          strokeWeight: 5,
        });

        polyline.setMap(map);
        routePolylinesRef.current.push(polyline);

        const startMarker = new window.google.maps.Marker({
          position: polylinePath[0],
          map: map,
          icon: Start_Point,
        });
        const endMarker = new window.google.maps.Marker({
          position: polylinePath[polylinePath.length - 1],
          map: map,
          icon: End_Point,
        });

        routeMarkerRefs.current.push(startMarker, endMarker);

        polylinePath.forEach((coord) => {
          bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
        });
      }
    });
  };

  // 경로 변경 처리
  useEffect(() => {
    // 지도 객체(map)가 없는 경우 실행하지 않음
    if (!map) return;

    if (routeFullCoords.length > 0 || spaceFullCoords.length > 0) {
      setIsClickedMap(false); // 새로운 검색 시 클릭 상태 초기화
    }

    // 경로(route) 및 공간(space) 데이터가 없고, 중심 좌표(lat, lng)가 설정되지 않은 경우
    if (
      routeFullCoords.length === 0 &&
      spaceFullCoords.length === 0 &&
      !isClickedMap
    ) {
      // 모든 마커와 폴리라인 제거
      clearRoutePolylines(); // 경로 폴리라인 제거
      clearRouteMarkers(); // 경로 마커 제거
      clearSpacePolylines(); // 공간 폴리라인 제거
      clearSpaceMarkers(); // 공간 마커 제거
      clearMarkers(); // 기타 마커 제거

      // 지도 중심 좌표 및 줌 레벨을 기본값으로 초기화
      const defaultCenter = {
        lat: parseFloat(process.env.REACT_APP_LATITUDE) || 0, // 기본 위도
        lng: parseFloat(process.env.REACT_APP_LONGITUDE) || 0, // 기본 경도
      };
      const defaultZoom = parseInt(process.env.REACT_APP_ZOOM, 10) || 12; // 기본 줌 레벨

      map.setCenter(defaultCenter); // 지도 중심 설정
      map.setZoom(defaultZoom); // 줌 레벨 설정

      // 경로 및 공간 데이터가 없으므로 종료
      return;
    }

    // 지도 경계 설정 객체 생성
    const bounds = new window.google.maps.LatLngBounds();

    // 특정 노드가 선택된 경우
    if (isClickedNodeActive && clickedNode) {
      // 선택된 노드의 시작 및 도착 좌표를 처리
      const startCoord = clickedNode.start_coord.split(',').map(Number); // 시작 좌표
      const goalCoord = clickedNode.goal_coord.split(',').map(Number); // 도착 좌표

      // 클릭된 노드의 경로를 정의
      const clickedRoute = [
        {
          coords: [
            { lat: startCoord[1], lng: startCoord[0] }, // 시작 지점
            { lat: goalCoord[1], lng: goalCoord[0] }, // 도착 지점
          ],
        },
      ];

      renderRoutes(clickedRoute, bounds); // 경로 렌더링
      map.fitBounds(bounds); // 지도 경계를 선택된 노드 경로에 맞게 조정
    } else {
      // 모든 경로 및 공간 데이터를 렌더링
      renderRoutes(routeFullCoords, bounds); // 경로 렌더링
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds); // 경계가 비어있지 않으면 지도 경계 조정
      }
    }
  }, [
    routeFullCoords, // 경로 데이터
    spaceFullCoords, // 공간 데이터
    clickedNode, // 클릭된 노드 데이터
    isClickedNodeActive, // 클릭된 노드 활성 상태
    map, // 지도 객체
  ]);

  // clickedNode 상태 업데이트
  useEffect(() => {
    if (clickedNode) {
      setIsClickedNodeActive(true); // 클릭된 노드가 있는 경우 활성 상태로 설정
    } else {
      setIsClickedNodeActive(false); // 클릭된 노드가 없는 경우 비활성 상태로 설정
    }
  }, [clickedNode]);

  // 새로운 검색 시 clickedNode를 초기화하고 모든 경로 표시
  useEffect(() => {
    if (routeFullCoords.length > 0 || spaceFullCoords.length > 0) {
      setIsClickedNodeActive(false); // clickedNode 비활성화
    }
  }, [routeFullCoords, spaceFullCoords]);

  // clickedNode 변경 시 지도의 중심을 업데이트하는 useEffect
  useEffect(() => {
    if (
      !map ||
      !clickedNode ||
      !clickedNode.start_coord ||
      !clickedNode.goal_coord
    ) {
      return;
    }

    const startCoord = clickedNode.start_coord.split(',').map(Number);
    const goalCoord = clickedNode.goal_coord.split(',').map(Number);
    const routeCoords = [
      { lat: startCoord[1], lng: startCoord[0] },
      { lat: goalCoord[1], lng: goalCoord[0] },
    ];

    const bounds = calculateBounds(routeCoords);
    map.fitBounds(bounds);
  }, [clickedNode, map]);

  // routeFullCoords 또는 spaceFullCoords가 변경될 때 clickedNode를 초기화
  useEffect(() => {
    if (routeFullCoords.length > 0 || spaceFullCoords.length > 0) {
      setIsClickedNodeActive(false);
    }
  }, [routeFullCoords, spaceFullCoords]);

  return (
    <div style={{ height: `calc(100vh - 102px)`, zIndex: '1' }} ref={mapRef} />
  );
}
