import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon

/**
 * 중심 좌표와 마커 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 위도와 경도를 포함한 객체
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE); // 환경 변수에서 기본 위도 값 가져오기
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE); // 환경 변수에서 기본 경도 값 가져오기
  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) }; // lat와 lng가 정의되어 있으면 해당 값 사용
  }
  return { lat: defaultLat, lng: defaultLng }; // 그렇지 않으면 기본 좌표 사용
}

/**
 * RoutoMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function RoutoMap({
  lat,
  lng,
  locationCoords = () => {},
  routeColors = () => {},
  routeFullCoords,
  spaceFullCoords,
  clickedNode,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref
  const [routeObjects, setRouteObjects] = useState([]); // Store route objects for clearing
  const [routeMarkers, setRouteMarkers] = useState([]); // Store markers for clearing
  const [spaceObjects, setSpaceObjects] = useState([]);
  const [spaceMarkers, setSpaceMarkers] = useState([]);
  const [previousRouteCoords, setPreviousRouteCoords] = useState([]);
  const [adjustedRouteCoords, setAdjustedRouteCoords] = useState([]);
  const [previousSpaceCoords, setPreviousSpaceCoords] = useState([]);
  const [adjustedSpaceCoords, setAdjustedSpaceCoords] = useState([]);

  // 경로와 마커를 모두 삭제하는 함수
  const clearRoutesAndMarkers = () => {
    // 지도에서 모든 경로(폴리라인) 제거
    routeObjects.forEach((route) => {
      if (route && typeof route.setMap === 'function') {
        route.setMap(null); // 지도에서 폴리라인 제거
      }
    });
    setRouteObjects([]); // 경로 객체 상태 초기화

    // 지도에서 모든 마커 제거
    routeMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null); // 지도에서 마커 제거
      }
    });
    setRouteMarkers([]); // 마커 상태 초기화
  };

  // 공간 경로와 마커를 모두 삭제하는 함수
  const clearSpaceAndMarkers = () => {
    spaceObjects.forEach((route) => {
      if (route && typeof route.setMap === 'function') {
        route.setMap(null); // 지도에서 공간 경로 제거
      }
    });
    setSpaceObjects([]); // 공간 객체 상태 초기화

    spaceMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null); // 지도에서 공간 마커 제거
      }
    });
    setSpaceMarkers([]); // 공간 마커 상태 초기화
  };

  /**
   * 삭제된 경로 인덱스를 찾는 함수
   * @param {Array} prevCoords - 이전 경로 데이터
   * @param {Array} currentCoords - 현재 경로 데이터
   * @returns {number} - 삭제된 경로의 인덱스
   */
  const findRemovedRouteIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id
      );
      if (isRouteRemoved) {
        return i; // Index of the removed route
      }
    }
    return -1; // No route was removed
  };

  // 경로 데이터 변경 감지 및 업데이트
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
        const newAdjustedCoords = [...previousRouteCoords];
        newAdjustedCoords[removedIndex] = null; // 삭제된 경로를 null로 표시
        setAdjustedRouteCoords(newAdjustedCoords);
      }
    } else {
      setAdjustedRouteCoords(routeFullCoords);
    }
    setPreviousRouteCoords(routeFullCoords);
  }, [routeFullCoords]);

  // 경로를 지도에 그리는 함수
  const drawCheckedRoutes = (mapInstance, routeFullCoords) => {
    clearRoutesAndMarkers(); // 기존 경로와 마커 삭제

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // Initialize bounds to fit all routes

    if (Array.isArray(routeFullCoords)) {
      adjustedRouteCoords.forEach((route, index) => {
        if (!route) {
          console.warn(`Skipping null route at index ${index}`);
          return;
        }

        if (Array.isArray(route.coords)) {
          const routePath = route.coords
            .map((coord) => {
              if (Array.isArray(coord)) {
                const [lng, lat] = coord;
                return { lat, lng };
              } else if (coord.lat !== undefined && coord.lng !== undefined) {
                return { lat: coord.lat, lng: coord.lng };
              } else {
                console.warn('Unexpected coord format:', coord);
                return null;
              }
            })
            .filter(Boolean);

          routePath.forEach((point) => {
            bounds.extend(new routo.maps.LatLng(point.lat, point.lng));
          });

          const strokeColor = routeColors[index % routeColors.length];
          const polyline = new routo.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: strokeColor,
            strokeOpacity: 1.0,
            strokeWeight: 5,
            map: mapInstance,
          });

          newRouteObjects.push(polyline);

          if (routePath.length > 0) {
            const startMarker = new routo.maps.Marker({
              position: routePath[0],
              map: mapInstance,
              icon: {
                url: Start_Point,
                scaledSize: new routo.maps.Size(30, 30),
              },
            });

            const endMarker = new routo.maps.Marker({
              position: routePath[routePath.length - 1],
              map: mapInstance,
              icon: {
                url: End_Point,
                scaledSize: new routo.maps.Size(30, 30),
              },
            });

            newRouteMarkers.push(startMarker, endMarker);
          }
        } else {
          console.warn(
            `route.coords for route ${index} is not in the expected format.`
          );
        }
      });

      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
      }
    } else {
      console.warn('routeFullCoords is not an array.');
    }

    setRouteObjects(newRouteObjects);
    setRouteMarkers(newRouteMarkers);
  };

  /**
   * 이전 좌표와 현재 좌표를 비교하여 제거된 공간 경로의 인덱스를 찾는 함수
   * @param {Array} prevCoords - 이전 공간 좌표 배열
   * @param {Array} currentCoords - 현재 공간 좌표 배열
   * @returns {number} - 제거된 공간 경로의 인덱스 (없으면 -1)
   */
  const findRemovedSpaceIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id
      );
      if (isRouteRemoved) {
        return i; // 제거된 경로의 인덱스 반환
      }
    }
    return -1; // 제거된 경로가 없을 경우 -1 반환
  };

  /**
   * 공간 경로 변경 시 상태를 업데이트하는 useEffect
   * @param {Array} spaceFullCoords - 현재 공간 경로 배열
   */
  useEffect(() => {
    if (
      previousSpaceCoords.length > 0 &&
      previousSpaceCoords.length > spaceFullCoords.length
    ) {
      const removedIndex = findRemovedSpaceIndex(
        previousSpaceCoords,
        spaceFullCoords
      );
      if (removedIndex !== -1) {
        const newAdjustedCoords = [...previousSpaceCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedSpaceCoords(newAdjustedCoords);
      }
    } else {
      setAdjustedSpaceCoords(spaceFullCoords);
    }
    setPreviousSpaceCoords(spaceFullCoords);
  }, [spaceFullCoords]);

  /**
   * 지도에 공간 경로를 렌더링하는 함수
   * @param {Object} mapInstance - 지도 인스턴스
   * @param {Array} spaceFullCoords - 렌더링할 공간 경로 배열
   */
  const drawSpaceRoutes = (mapInstance, spaceFullCoords) => {
    clearSpaceAndMarkers(); // 기존 경로 및 마커 삭제

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // 모든 경로를 포함하는 범위 초기화

    if (Array.isArray(spaceFullCoords)) {
      adjustedSpaceCoords.forEach((space, index) => {
        if (!space) {
          console.warn(`Index ${index}에서 null 공간 경로를 건너뜁니다.`);
          return;
        }

        if (Array.isArray(space.coords)) {
          const spacePath = space.coords
            .map((coord) => {
              if (Array.isArray(coord)) {
                const [lng, lat] = coord;
                return { lat, lng };
              } else if (coord.lat !== undefined && coord.lng !== undefined) {
                return { lat: coord.lat, lng: coord.lng };
              } else {
                return null;
              }
            })
            .filter(Boolean);

          // 경로의 각 포인트를 사용하여 범위 확장
          spacePath.forEach((point) => {
            bounds.extend(new routo.maps.LatLng(point.lat, point.lng));
          });

          const strokeColor = routeColors[index % routeColors.length];
          const polyline = new routo.maps.Polyline({
            path: spacePath,
            geodesic: true,
            strokeColor: strokeColor,
            strokeOpacity: 1.0,
            strokeWeight: 5,
            map: mapInstance,
          });

          newRouteObjects.push(polyline);

          if (spacePath.length > 0) {
            const startMarker = new routo.maps.Marker({
              position: spacePath[0],
              map: mapInstance,
              icon: {
                url: Start_Point,
                scaledSize: new routo.maps.Size(30, 30),
              },
            });

            const endMarker = new routo.maps.Marker({
              position: spacePath[spacePath.length - 1],
              map: mapInstance,
              icon: {
                url: End_Point,
                scaledSize: new routo.maps.Size(30, 30),
              },
            });

            newRouteMarkers.push(startMarker, endMarker);
          }
        } else {
          console.warn(
            `space.coords의 형식이 올바르지 않습니다. Index: ${index}`
          );
        }
      });

      // 모든 경로를 처리한 후 지도 범위 조정
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
      }
    } else {
      console.warn('spaceFullCoords는 배열이 아닙니다.');
    }

    setSpaceObjects(newRouteObjects);
    setSpaceMarkers(newRouteMarkers);
  };

  /**
   * 클릭된 노드에 따라 지도를 특정 경로에 맞게 중심으로 이동시키는 useEffect
   * @param {Object} clickedNode - 클릭된 노드의 정보 (시작 및 목표 좌표 포함)
   */
  useEffect(() => {
    if (clickedNode && clickedNode.start_coord && clickedNode.goal_coord) {
      const [startLng, startLat] = clickedNode.start_coord
        .split(',')
        .map(parseFloat);
      const [goalLng, goalLat] = clickedNode.goal_coord
        .split(',')
        .map(parseFloat);

      if (mapRef.current) {
        const bounds = new routo.maps.LatLngBounds();

        bounds.extend(new routo.maps.LatLng(startLat, startLng));
        bounds.extend(new routo.maps.LatLng(goalLat, goalLng));

        mapRef.current.fitBounds(bounds); // 경로에 맞게 지도 범위 조정

        if (markerRef.current) {
          markerRef.current.setMap(null); // 마커 제거
        }
      }
    }
  }, [clickedNode]);

  /**
   * 새로운 중심 좌표에 따라 마커를 업데이트하거나 생성하는 함수
   * @param {Object} newCenter - 새로 설정할 지도 중심 좌표
   */
  const updateMarker = (newCenter) => {
    if (markerRef.current) {
      markerRef.current.setPosition(newCenter); // 기존 마커 위치 업데이트
    } else {
      if (
        newCenter.lat !== parseFloat(process.env.REACT_APP_LATITUDE) ||
        newCenter.lng !== parseFloat(process.env.REACT_APP_LONGITUDE)
      ) {
        markerRef.current = new routo.maps.Marker({
          position: newCenter,
          map: mapRef.current,
        });
      }
    }
  };

  /**
   * 지도 클릭 이벤트 리스너를 재설정하는 함수
   */
  const attachClickListener = () => {
    if (mapRef.current) {
      routo.maps.event.clearListeners(mapRef.current, 'click'); // 기존 리스너 제거
      mapRef.current.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        locationCoords({ lat: clickedLat, lng: clickedLng }); // 클릭 좌표 전달
      });
    }
  };

  /**
   * 초기 중심 좌표를 기준으로 지도를 초기화하고 마커를 생성하는 useEffect
   */
  useEffect(() => {
    const loadMapScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.routo.com/v2/maps/map?key=' +
        process.env.REACT_APP_ROUTTO_MAP_API; // Routo Maps API 스크립트 로드
      script.async = true;
      script.onload = () => {
        if (!mapRef.current) {
          mapRef.current = new routo.maps.Map(document.getElementById('map'), {
            center: { lat: center.lat, lng: center.lng },
            zoom: Number(process.env.REACT_APP_ZOOM),
          });
        }

        updateMarker(center);
        attachClickListener();

        // Initial rendering of space routes
        if (Array.isArray(spaceFullCoords)) {
          drawSpaceRoutes(mapRef.current, spaceFullCoords);
        }
      };
      document.body.appendChild(script);
    };

    if (!window.routo) {
      loadMapScript();
    } else {
      if (!mapRef.current) {
        mapRef.current = new routo.maps.Map('map', {
          center: { lat: center.lat, lng: center.lng },
          zoom: Number(process.env.REACT_APP_ZOOM),
        });
      }

      updateMarker(center);
      attachClickListener();

      if (Array.isArray(spaceFullCoords)) {
        drawSpaceRoutes(mapRef.current, spaceFullCoords);
      }
    }

    return () => {
      if (mapRef.current) {
        routo.maps.event.clearListeners(mapRef.current, 'click');
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      clearSpaceAndMarkers();
    };
  }, [center, spaceFullCoords]);

  /**
   * 경로 좌표가 변경될 때 기존 경로와 마커를 제거하고 새로운 경로와 마커를 그리는 useEffect
   */
  useEffect(() => {
    if (mapRef.current && Array.isArray(adjustedRouteCoords)) {
      clearRoutesAndMarkers(); // 기존 경로와 마커 제거
      drawCheckedRoutes(mapRef.current, adjustedRouteCoords); // 새로운 경로와 마커 렌더링
    }
  }, [mapRef.current, adjustedRouteCoords]);

  /**
   * 경로 좌표가 변경될 때 기존 경로와 마커를 제거하고 새로운 경로와 마커를 그리는 useEffect
   * (지도 인스턴스와 수정된 공간 경로(adjustedSpaceCoords)가 업데이트될 때 실행)
   */
  useEffect(() => {
    if (mapRef.current && Array.isArray(adjustedSpaceCoords)) {
      clearRoutesAndMarkers(); // 기존 경로와 마커를 제거
      drawCheckedRoutes(mapRef.current, adjustedSpaceCoords); // 수정된 공간 경로를 사용하여 새로운 경로와 마커를 지도에 그리기
    }
  }, [mapRef.current, adjustedSpaceCoords]);

  /**
   * 위도(lat)와 경도(lng)가 변경될 때 지도 중심과 마커를 업데이트하는 useEffect
   */
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng); // 새로운 중심 좌표 계산
    setCenter(newCenter); // 중심 좌표 상태 업데이트
    if (mapRef.current) {
      mapRef.current.setCenter(newCenter); // 지도 중심 좌표 업데이트
    }
    updateMarker(newCenter); // 마커 업데이트 또는 생성
  }, [lat, lng]);

  return <div id="map" className="map" style={{ height: '87.8vh' }} />;
}
