import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon

/**
 * 중심 좌표와 마커 좌표를 계산하는 함수
 * lat : 위도
 * lng : 경도
 * Object : 위도와 경도를 포함한 객체
 * @param {number} lat
 * @param {number} lng
 * @returns {Object}
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
 * lat : 위도
 * lng : 경도
 * locationCoords : 클릭한 좌표를 부모로 전달하기 위한 함수
 * @param {number} lat
 * @param {number} lng
 * @param {function} locationCoords
 * @param {function} routeColors
 * @param {Array} routeFullCoords
 * @param {Array} spaceFullCoords
 * @param {object} clickedNode
 * @param {function} onClearMap
 * @param {string} selectedAPI
 * @param {string} typeMap
 */
export default function RoutoMap({
  lat,
  lng,
  locationCoords = () => {},
  routeColors = () => {},
  routeFullCoords,
  spaceFullCoords,
  clickedNode,
  onClearMap,
  selectedAPI,
  typeMap,
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
  const [focusedNode, setFocusedNode] = useState(null);
  const [shouldResetToDefault, setShouldResetToDefault] = useState(true); // 기본 좌표 복귀 여부
  const [markerPosition, setMarkerPosition] = useState(null);
  const routesColors = useRef(new Map());
  const choosenMap =
    typeMap === 'Basic Map'
      ? 'Roadmap_Half_Basic'
      : typeMap === 'Satellite Map'
      ? 'Satellite'
      : 'Hybrid';

  useEffect(() => {
    routeFullCoords = []; // 경로 좌표 배열을 빈 배열로 초기화
    spaceFullCoords = []; // 공간 좌표 배열을 빈 배열로 초기화
    routeColors = []; // 경로 색상 배열을 빈 배열로 초기화
    clickedNode = null; // 클릭된 노드 값을 null로 초기화
    setShouldResetToDefault(true); // 클릭한 좌표 유지
  }, []); // 빈 dependency 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  /**
   * 경로가 제거되었을 때 이를 감지하고 adjustedRouteCoords를 업데이트하는 effect
   */
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
      setAdjustedRouteCoords(routeFullCoords); // 경로가 제거되지 않았다면 현재 경로로 업데이트
    }
    setPreviousRouteCoords(routeFullCoords); // 이전 경로를 현재 경로로 업데이트
  }, [routeFullCoords]);

  /**
   * 공간 좌표가 제거되었을 때 이를 감지하고 adjustedSpaceCoords를 업데이트하는 effect
   */
  useEffect(() => {
    // 공간 좌표가 변경될 때 처리
    if (
      previousSpaceCoords.length > 0 &&
      previousSpaceCoords.length > spaceFullCoords.length
    ) {
      const removedIndex = findRemovedSpaceIndex(
        previousSpaceCoords,
        spaceFullCoords
      );
      if (removedIndex !== -1) {
        const updatedSpaceObjects = [...spaceObjects];
        const updatedSpaceMarkers = [...spaceMarkers];

        // 폴리라인 제거
        if (updatedSpaceObjects[removedIndex]) {
          updatedSpaceObjects[removedIndex].setMap(null);
          updatedSpaceObjects[removedIndex] = null;
        } else {
          console.warn(`No polyline found at index ${removedIndex}`);
        }

        // 마커 제거
        if (Array.isArray(updatedSpaceMarkers[removedIndex])) {
          updatedSpaceMarkers[removedIndex].forEach((marker) => {
            if (marker && typeof marker.setMap === 'function') {
              marker.setMap(null);
            } else {
              console.warn('Invalid marker:', marker);
            }
          });
          updatedSpaceMarkers[removedIndex] = null;
        } else {
          console.warn(`Markers at index ${removedIndex} are not an array.`);
        }

        // 상태 업데이트
        setSpaceObjects(updatedSpaceObjects);
        setSpaceMarkers(updatedSpaceMarkers);

        // adjustedSpaceCoords 업데이트
        const updatedAdjustedCoords = [...previousSpaceCoords];
        updatedAdjustedCoords[removedIndex] = null;
        setAdjustedSpaceCoords(updatedAdjustedCoords);
      }
    } else {
      // 공간이 추가되거나 변경된 경우
      setAdjustedSpaceCoords(spaceFullCoords);
    }

    // 이전 공간 좌표를 현재 좌표로 업데이트
    setPreviousSpaceCoords(spaceFullCoords);
  }, [spaceFullCoords]);

  /**
   * adjustedSpaceCoords가 변경되었을 때 맵을 업데이트하는 effect
   */
  useEffect(() => {
    if (mapRef.current && Array.isArray(adjustedSpaceCoords)) {
      clearSpaceAndMarkers();
      if (adjustedSpaceCoords.length > 0) {
        drawSpaceRoutes(mapRef.current, adjustedSpaceCoords); // Draw new routes
      }
    }
  }, [adjustedSpaceCoords]);

  /**
   * clickedNode가 주어졌을 때 해당 경로로 맵을 중심으로 이동시키는 effect
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

        setTimeout(() => {
          mapRef.current.fitBounds(bounds);
          setFocusedNode(clickedNode);
        }, 100);
      }
    }
  }, [clickedNode]);

  /**
   * 지도 초기화 관련 UseEffect
   */
  useEffect(() => {
    if (onClearMap) {
      clearRoutesAndMarkers();
      clearSpaceAndMarkers();

      mapRef.current = new routo.maps.Map('map', {
        center: { lat: center.lat, lng: center.lng },
        zoom: Number(process.env.REACT_APP_ZOOM),
        mapTypeId: choosenMap, // 기존 choosenMap 유지
      });

      // onClearMap 상태 리셋
      setTimeout(() => {
        onClearMap = false; // 부모 컴포넌트에서 상태 리셋
      }, 100);
      setShouldResetToDefault(true); // 클릭한 좌표 유지
    }
  }, [onClearMap, choosenMap]); // choosenMap을 dependency로 추가

  /**
   * 경로와 마커를 모두 삭제하는 함수
   */
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

    // focusedNode 초기화
    setFocusedNode(null); // 경계를 재조정할 수 있도록 리셋
  };

  useEffect(() => {
    const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
    const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

    // 모든 경로와 공간이 해제되었고 기본 좌표 복귀가 활성화된 경우만 실행
    if (
      spaceFullCoords.length === 0 &&
      routeFullCoords.length === 0 &&
      shouldResetToDefault
    ) {
      setCenter({ lat: defaultLat, lng: defaultLng }); // 기본 좌표 설정
      if (mapRef.current) {
        mapRef.current.setCenter({ lat: defaultLat, lng: defaultLng }); // 지도 중심 설정
        mapRef.current.setZoom(Number(process.env.REACT_APP_ZOOM)); // 기본 줌 설정
      }
    }
  }, [spaceFullCoords, routeFullCoords, shouldResetToDefault]);

  /**
   * 공간 경로와 마커를 지도에서 제거하는 함수
   */
  const clearSpaceAndMarkers = () => {
    // 모든 공간 경로 제거
    spaceObjects.forEach((route) => {
      if (route && typeof route.setMap === 'function') {
        route.setMap(null); // 지도에서 폴리라인 제거
      }
    });
    setSpaceObjects([]); // 경로 객체 상태 초기화

    // 모든 마커 제거
    spaceMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null); // 지도에서 마커 제거
      }
    });
    setSpaceMarkers([]); // 마커 상태 초기화
  };

  /**
   * findRemovedRouteIndex
   * 이전 경로 목록과 현재 경로 목록을 비교하여 제거된 경로의 인덱스를 반환하는 함수
   *
   * @param {Array} prevCoords 이전 경로 좌표 배열
   * @param {Array} currentCoords 현재 경로 좌표 배열
   * @returns {number} 제거된 경로의 인덱스 (없을 경우 -1 반환)
   */
  const findRemovedRouteIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id // 이전 경로와 동일한 file_id를 가진 경로가 현재 목록에 있는지 확인
      );
      if (isRouteRemoved) {
        return i; // 제거된 경로의 인덱스 반환
      }
    }
    return -1; // 제거된 경로가 없으면 -1 반환
  };

  /**
   * drawCheckedRoutes
   * 선택된 경로를 지도에 그리는 함수
   *
   * @param {Object} mapInstance 지도 인스턴스
   * @param {Array} routeFullCoords 전체 경로 좌표 배열
   */
  const drawCheckedRoutes = (mapInstance, routeFullCoords) => {
    if (!Array.isArray(routeFullCoords) || routeFullCoords.length === 0) {
      return;
    }
    clearRoutesAndMarkers(); // 기존 경로와 마커 삭제

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // 모든 경로를 포함하는 경계를 초기화

    if (Array.isArray(routeFullCoords)) {
      adjustedRouteCoords.forEach((route, index) => {
        if (!route) {
          return;
        }

        if (Array.isArray(route.coords)) {
          // 경로 좌표 배열 생성
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
            .filter(Boolean); // 유효한 좌표만 필터링

          // 경로의 각 점을 경계에 추가
          routePath.forEach((point) => {
            bounds.extend(new routo.maps.LatLng(point.lat, point.lng));
          });

          // 경로를 그리기 위한 Polyline 생성
          const strokeColor =
            routesColors.current.get(route.file_id) ||
            routeColors[index % routeColors.length];
          routesColors.current.set(route.file_id, strokeColor);
          const polyline = new routo.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: strokeColor,
            strokeOpacity: 1.0,
            strokeWeight: 5,
            map: mapInstance,
          });

          newRouteObjects.push(polyline);

          // 시작 및 끝 마커 추가
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
          ); // 예상치 못한 좌표 형식 경고
        }
      });

      if (!focusedNode && !bounds.isEmpty()) {
        mapInstance.fitBounds(bounds); // Only adjust bounds if no focusedNode
      }
    } else {
      console.warn('routeFullCoords is not an array.'); // 예상치 못한 경로 배열 형식 경고
    }

    setRouteObjects(newRouteObjects); // 경로 객체 상태 업데이트
    setRouteMarkers(newRouteMarkers); // 마커 상태 업데이트
  };

  /**
   * findRemovedSpaceIndex
   * 이전 공간 좌표와 현재 공간 좌표를 비교하여 제거된 공간 좌표의 인덱스를 반환
   *
   * @param {Array} prevCoords 이전 공간 좌표 배열
   * @param {Array} currentCoords 현재 공간 좌표 배열
   * @returns {number} 제거된 공간의 인덱스 (없을 경우 -1 반환)
   */
  const findRemovedSpaceIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id // 동일한 file_id가 있는지 확인
      );
      if (isRouteRemoved) {
        return i; // 제거된 공간의 인덱스 반환
      }
    }
    return -1; // 제거된 공간이 없으면 -1 반환
  };

  /**
   * drawSpaceRoutes
   * 공간 경로를 지도에 그리는 함수
   *
   * @param {Object} mapInstance 지도 인스턴스
   * @param {Array} spaceFullCoords 공간 경로 좌표 배열
   */
  const drawSpaceRoutes = (mapInstance, spaceFullCoords) => {
    clearSpaceAndMarkers(); // 기존 경로 및 마커 삭제

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // 모든 경로를 포함하는 범위 초기화

    if (Array.isArray(spaceFullCoords)) {
      adjustedSpaceCoords.forEach((space, index) => {
        if (!space) {
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
                return null; // 예상치 못한 좌표 형식 처리
              }
            })
            .filter(Boolean);

          // 경로의 각 포인트를 사용하여 범위 확장
          spacePath.forEach((point) => {
            bounds.extend(new routo.maps.LatLng(point.lat, point.lng));
          });

          const strokeColor =
            routesColors.current.get(space.file_id) ||
            routeColors[index % routeColors.length];
          routesColors.current.set(space.file_id, strokeColor);
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
            `space.coords의 형식이 올바르지 않습니다. Index: ${index}` // 예상치 못한 좌표 형식 경고
          );
        }
      });

      // 모든 경로를 처리한 후 지도 범위 조정
      if (!focusedNode && !bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
      }
    } else {
      console.warn('spaceFullCoords는 배열이 아닙니다.'); // 잘못된 입력 형식 경고
    }

    setSpaceObjects(newRouteObjects); // 공간 경로 객체 상태 업데이트
    setSpaceMarkers(newRouteMarkers); // 마커 상태 업데이트
  };

  /**
   * updateMarker
   * 새로운 중심점으로 마커를 업데이트하거나 생성하는 함수
   *
   * @param {Object} newCenter 새로운 중심점 좌표
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
   * attachClickListener
   * 지도 클릭 이벤트 리스너를 다시 연결하는 함수
   */
  const attachClickListener = () => {
    if (mapRef.current) {
      routo.maps.event.clearListeners(mapRef.current, 'click'); // 기존 리스너 제거
      mapRef.current.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        setShouldResetToDefault(false); // 기본 좌표 복귀 비활성화
        locationCoords({ lat: clickedLat, lng: clickedLng }); // 클릭한 좌표를 전달
      });
    }
  };

  // 맵 타입이 변경될 때 이를 즉시 반영하는 useEffect
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(choosenMap); // mapTypeId를 업데이트
    }
  }, [choosenMap]);

  const loadMapScript = () => {
    const script = document.createElement('script');
    const baseUrl = 'https://api.routo.com/v2/maps/map'; // Routo Maps API의 기본 URL
    const url = new URL(baseUrl); // URL 객체를 사용하여 URL을 안전하게 생성
    url.searchParams.append('key', selectedAPI); // API 키를 URL의 query parameter로 추가

    script.src = url.toString(); // 안전하게 구성된 URL을 script의 src로 설정
    script.async = true; // 비동기적으로 스크립트를 로드

    script.onload = () => {
      // mapRef가 초기화되지 않은 경우 지도 인스턴스를 생성
      if (!mapRef.current) {
        mapRef.current = new routo.maps.Map(document.getElementById('map'), {
          center: { lat: center.lat, lng: center.lng }, // 초기 중심 좌표 설정
          zoom: Number(process.env.REACT_APP_ZOOM), // 초기 줌 레벨 설정
          mapTypeId: choosenMap,
        });
      }

      updateMarker(center); // 초기 마커를 설정
      attachClickListener(); // 지도 클릭 리스너를 연결

      // 공간 경로를 초기 렌더링
      if (Array.isArray(spaceFullCoords)) {
        drawSpaceRoutes(mapRef.current, spaceFullCoords); // 공간 경로를 지도에 그리기
      }
    };

    document.body.appendChild(script); // script 태그를 body에 추가하여 스크립트를 로드
  };

  /**
   * 초기 중심점으로 마커를 표시하며 지도를 초기화하는 useEffect
   */
  useEffect(() => {
    if (!window.routo) {
      loadMapScript();
    } else {
      if (!mapRef.current) {
        mapRef.current = new routo.maps.Map('map', {
          center: { lat: center.lat, lng: center.lng },
          zoom: Number(process.env.REACT_APP_ZOOM),
        });
      }

      updateMarker(center); // 초기 마커 설정

      // 클릭 이벤트 리스너 추가
      mapRef.current.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();

        setShouldResetToDefault(false); // 클릭한 좌표 유지
        // 부모 컴포넌트로 클릭된 좌표 전달
        locationCoords({ lat: clickedLat, lng: clickedLng });
      });

      // 중심 좌표 업데이트 방지
      if (onClearMap) {
        mapRef.current.setOptions({ draggable: true }); // 지도 드래그 가능
        mapRef.current.setCenter({ lat: center.lat, lng: center.lng }); // 기존 중심 유지
        mapRef.current.setZoom(Number(process.env.REACT_APP_ZOOM)); // 기존 줌 유지
      }
    }

    return () => {
      if (mapRef.current) {
        routo.maps.event.clearListeners(mapRef.current, 'dragend'); // 드래그 리스너 제거
        routo.maps.event.clearListeners(mapRef.current, 'click'); // 클릭 리스너 제거
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null; // 마커 초기화
      }
    };
  }, [center]);

  useEffect(() => {
    setShouldResetToDefault(false); // 초기 상태를 false로 설정
  }, []);

  useEffect(() => {
    if (routeFullCoords.length > 0 || spaceFullCoords.length > 0) {
      setShouldResetToDefault(true);
    }
  }, [routeFullCoords, spaceFullCoords]);

  /**
   * 경로 좌표가 변경될 때 기존 경로와 마커를 제거하고 새로운 경로와 마커를 그리는 useEffect
   */
  useEffect(() => {
    if (routeFullCoords.length > 0) {
      clearRoutesAndMarkers(); // 기존 경로 및 마커 제거
      drawCheckedRoutes(mapRef.current, routeFullCoords);
    }
  }, [adjustedRouteCoords]);

  /**
   * 위도(lat)와 경도(lng)가 변경될 때 지도 중심과 마커를 업데이트하는 useEffect
   */
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      const newCenter = calculateCenterAndMarker(lat, lng);
      setCenter(newCenter);
      if (mapRef.current) {
        mapRef.current.setCenter(newCenter);
      }
      updateMarker(newCenter);
      setMarkerPosition(newCenter); // 상태 변경을 통해 강제 리렌더링
      locationCoords({ lat, lng });
    }
  }, [lat, lng, markerPosition]);

  return <div id="map"  className="inset-0 w-full h-full -z-10" />;
}
