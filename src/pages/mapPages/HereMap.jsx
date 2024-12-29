import React, { useEffect, useRef, useState } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg';
import Start_Point from '../../assets/images/multi_start_point.svg';

/**
 * 지도 중심 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 지도 중심 좌표 (위도와 경도 포함)
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE) || 0;
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE) || 0;
  return lat && lng
    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
    : { lat: defaultLat, lng: defaultLng };
}

/**
 * HereMap 컴포넌트
 * @param {Object} props
 * @param {number} lat - 초기 지도 중심 위도 값
 * @param {number} lng - 초기 지도 중심 경도 값
 * @param {function} locationCoords - 지도 클릭 시 좌표를 부모로 전달하는 콜백
 * @param {Array} routeFullCoords - 경로를 나타내는 좌표 배열
 * @param {Array} routeColors - 경로 색상을 나타내는 배열
 * @param {Object} clickedNode - 선택된 노드 데이터
 * @param {Array} spaceFullCoords - 공간 데이터를 나타내는 좌표 배열
 * @param {Object} checkedNode - 선택된 노드 데이터 상태
 * @param {function} onClearMap - 지도 초기화 함수
 */
const HereMap = ({
  lat,
  lng,
  locationCoords = () => {}, // 지도 클릭 시 호출되는 콜백 함수
  routeFullCoords, // 경로 전체 좌표
  routeColors = () => {}, // 경로 색상 배열
  clickedNode, // 선택된 노드 데이터
  spaceFullCoords, // 공간 전체 좌표
  checkedNode, // 선택된 노드 상태
  onClearMap,
}) => {
  const routesColors = useRef(new Map());
  const mapRef = useRef(null); // 지도 DOM 요소 참조
  const mapInstance = useRef(null); // HERE 지도 인스턴스 참조
  const platformInstance = useRef(null); // HERE 플랫폼 인스턴스 참조
  const markerRef = useRef(null); // 지도 마커 참조
  const polylineRefs = useRef({ routes: [], spaces: [] }); // 폴리라인 참조
  const markerRefs = useRef({ routes: [], spaces: [] }); // 마커 참조
  const [previousRouteCoords, setPreviousRouteCoords] = useState([]); // 이전 경로 좌표 상태
  const [adjustedRouteCoords, setAdjustedRouteCoords] = useState([]); // 조정된 경로 좌표 상태
  const [previousSpaceCoords, setPreviousSpaceCoords] = useState([]); // 이전 공간 좌표 상태
  const [adjustedSpaceCoords, setAdjustedSpaceCoords] = useState([]); // 조정된 공간 좌표 상태
  const [getCentered, setCentered] = useState(false); // 지도 중심 조정 상태
  const [disableCentering, setDisableCentering] = useState(false); // 자동 중심 조정 비활성화 상태
  const [clickedCoords, setClickedCoords] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const apiKey = process.env.REACT_APP_HERE_MAP_API; // HERE Maps API 키

  useEffect(() => {
    routeFullCoords = []; // 경로 좌표 배열을 빈 배열로 초기화
    checkedNode = []; // 선택된 노드 배열을 빈 배열로 초기화
    spaceFullCoords = []; // 공간 좌표 배열을 빈 배열로 초기화
    routeColors = []; // 경로 색상 배열을 빈 배열로 초기화
    clickedNode = null; // 클릭된 노드 값을 null로 초기화
  }, []); // 빈 dependency 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  /**
   * 지도 중심을 설정하고 검색 마커를 추가하는 함수
   * @param {number} latitude - 위도 값
   * @param {number} longitude - 경도 값
   */
  const centerMapOnLatLng = (latitude, longitude) => {
    if (!mapInstance.current) {
      console.error('Map instance is not initialized');
      return;
    }

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return;
    }

    // 기존 마커 제거
    if (markerRef.current) {
      mapInstance.current.removeObject(markerRef.current);
    }

    // 새 마커 추가
    const searchMarker = new H.map.Marker({ lat: latitude, lng: longitude });
    mapInstance.current.addObject(searchMarker);
    markerRef.current = searchMarker;

    // 지도 중심 설정
    setTimeout(() => {
      mapInstance.current.setCenter({ lat: latitude, lng: longitude });
      console.log(`Map centered to: ${latitude}, ${longitude}`);
    }, 0); // 딜레이를 추가해 다른 작업 이후에 중심 설정
  };

  /**
   * 지도 중심과 줌을 설정하는 함수
   * @param {number} latitude - 위도 값
   * @param {number} longitude - 경도 값
   * @param {number} [zoomLevel] - 줌 레벨 (옵션)
   */
  const centerMapWithoutMarker = (latitude, longitude, zoomLevel) => {
    if (mapInstance.current && latitude && longitude) {
      mapInstance.current.setCenter({ lat: latitude, lng: longitude });

      if (typeof zoomLevel === 'number') {
        mapInstance.current.setZoom(zoomLevel);
      }
    } else {
      console.error(
        'Map instance not initialized or invalid coordinates provided'
      );
    }
  };

  // lat과 lng가 변경될 때마다 지도 중심을 업데이트
  useEffect(() => {
    if (clickedCoords || disableCentering) {
      return;
    }

    if (lat === undefined || lng === undefined) {
      clearMarkers();
    } else if (!getCentered) {
      centerMapOnLatLng(lat, lng);
    }
    console.log('lat:', lat, 'lng:', lng);
  }, [lat, lng, getCentered, clickedCoords, disableCentering]);

  // routeFullCoords와 spaceFullCoords가 빈 리스트일 경우 지도 중심 초기화
  useEffect(() => {
    const isAnyRouteChecked = routeFullCoords.some(
      (route) => checkedNode[route.file_id] !== false
    );
    const isAnySpaceChecked = spaceFullCoords.length > 0;

    if (!isAnyRouteChecked && !isAnySpaceChecked) {
      clearEntities('routes');
      clearEntities('spaces');

      if (!disableCentering && lat === undefined && lng === undefined) {
        const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE) || 0;
        const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE) || 0;
        const defaultZoom = Number(process.env.REACT_APP_ZOOM) || 17;

        setTimeout(() => {
          centerMapWithoutMarker(defaultLat, defaultLng, defaultZoom);
        }, 0);
      }
    }
  }, [routeFullCoords, spaceFullCoords, checkedNode, disableCentering]);

  /**
   * 이전 경로 또는 공간 데이터에서 제거된 인덱스를 찾는 함수
   * @param {Array} prevCoords - 이전 좌표 배열
   * @param {Array} currentCoords - 현재 좌표 배열
   * @returns {number} - 제거된 항목의 인덱스 (없으면 -1)
   */
  const findRemovedIndex = (prevCoords, currentCoords) => {
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

  // 경로가 제거되었을 때 `adjustedRouteCoords`를 업데이트하는 effect
  useEffect(() => {
    if (
      previousRouteCoords.length > 0 &&
      previousRouteCoords.length > routeFullCoords.length
    ) {
      const removedIndex = findRemovedIndex(
        previousRouteCoords,
        routeFullCoords
      );
      if (removedIndex !== -1) {
        // 제거된 인덱스에 null 값을 추가하여 새 배열 생성
        const newAdjustedCoords = [...previousRouteCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedRouteCoords(newAdjustedCoords);
      }
    } else {
      // 경로가 제거되지 않은 경우, `adjustedRouteCoords`를 `routeFullCoords`와 동일하게 설정
      setAdjustedRouteCoords(routeFullCoords);
    }

    // 이전 경로 상태를 업데이트
    setPreviousRouteCoords(routeFullCoords);
  }, [routeFullCoords]);

  useEffect(() => {
    if (clickedNode && mapInstance.current) {
      const {
        bb_bottomleft_lat,
        bb_bottomleft_lng,
        bb_topright_lat,
        bb_topright_lng,
      } = clickedNode;
      const bounds = new H.geo.Rect(
        bb_bottomleft_lat,
        bb_bottomleft_lng,
        bb_topright_lat,
        bb_topright_lng
      );
      mapInstance.current.getViewModel().setLookAtData({ bounds });
    }
  }, [clickedNode]);

  // 공간 데이터 변경 시 조정된 공간 데이터를 업데이트
  useEffect(() => {
    if (
      previousSpaceCoords.length > 0 &&
      previousSpaceCoords.length > spaceFullCoords.length
    ) {
      const removedIndex = findRemovedIndex(
        previousSpaceCoords,
        spaceFullCoords
      );
      if (removedIndex !== -1) {
        const newAdjustedSpaceCoords = [...previousSpaceCoords];
        newAdjustedSpaceCoords[removedIndex] = null;
        setAdjustedSpaceCoords(newAdjustedSpaceCoords);
      }
    } else {
      setAdjustedSpaceCoords(spaceFullCoords);
    }
    setPreviousSpaceCoords(spaceFullCoords);
  }, [spaceFullCoords]);

  /**
   * 이전 좌표와 현재 좌표를 비교하여 조정된 좌표를 업데이트하는 함수
   * @param {Array} previousCoords - 이전 좌표 배열
   * @param {Array} currentCoords - 현재 좌표 배열
   * @param {function} setAdjustedCoords - 조정된 좌표를 업데이트하는 상태 설정 함수
   * @param {function} setPreviousCoords - 이전 좌표를 업데이트하는 상태 설정 함수
   */
  const updateAdjustedCoords = (
    previousCoords,
    currentCoords,
    setAdjustedCoords,
    setPreviousCoords
  ) => {
    if (
      previousCoords.length > 0 &&
      previousCoords.length > currentCoords.length
    ) {
      const removedIndex = findRemovedIndex(previousCoords, currentCoords);
      if (removedIndex !== -1) {
        const newAdjustedCoords = [...previousCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedCoords(newAdjustedCoords);
      }
    } else {
      setAdjustedCoords(currentCoords);
    }
    setPreviousCoords(currentCoords);
  };

  useEffect(() => {
    updateAdjustedCoords(
      previousRouteCoords,
      routeFullCoords,
      setAdjustedRouteCoords,
      setPreviousRouteCoords
    );
  }, [routeFullCoords]);

  useEffect(() => {
    updateAdjustedCoords(
      previousSpaceCoords,
      spaceFullCoords,
      setAdjustedSpaceCoords,
      setPreviousSpaceCoords
    );
  }, [spaceFullCoords]);

  useEffect(() => {
    if (spaceFullCoords.length > 0) {
      setDisableCentering(false); // 공간 검색 시 자동 중심 조정을 활성화
    }
  }, [spaceFullCoords]);

  /**
   * 지도에 표시된 엔티티(좌표들)를 중심으로 지도 중심 및 줌을 조정하는 함수
   * @param {Array} coords - 좌표 배열
   */
  const fitMapToEntities = (coords, type) => {
    if (
      !coords ||
      coords.length === 0 ||
      !mapInstance.current ||
      disableCentering
    ) {
      return; // disableCentering이 true라면 중심 설정을 건너뜁니다.
    }

    const validCoords = coords.filter(
      (coord) => coord !== null && coord.coords?.length > 0
    );

    if (validCoords.length === 0) {
      clearEntities(type);
      return;
    }

    let bounds = null;
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;

    validCoords.forEach((coord) => {
      coord.coords.forEach((point) => {
        if (
          point &&
          typeof point.lat === 'number' &&
          typeof point.lng === 'number'
        ) {
          totalLat += point.lat;
          totalLng += point.lng;
          pointCount += 1;

          if (!bounds) {
            bounds = new H.geo.Rect(point.lat, point.lng, point.lat, point.lng);
          } else {
            bounds.mergePoint({ lat: point.lat, lng: point.lng });
          }
        }
      });
    });

    // 중심점 계산
    const midLat = pointCount > 0 ? totalLat / pointCount : 0;
    const midLng = pointCount > 0 ? totalLng / pointCount : 0;

    if (clickedNode === null) {
      // 지도 중심을 계산된 중심점으로 설정하고 줌 레벨을 조정
      mapInstance.current.setCenter({ lat: midLat, lng: midLng });
      mapInstance.current.setZoom(10);
    }
  };

  // 상태 초기화와 함께 `fitMapToEntities` 호출
  useEffect(() => {
    const resetAndDisplayAllEntities = () => {
      // Clear existing entities
      clearEntities('routes');
      clearEntities('spaces');

      // 새로운 경로 렌더링
      if (routeFullCoords.length > 0) {
        renderEntities(routeFullCoords, 'routes'); // 경로 렌더링
        fitMapToEntities(routeFullCoords, 'routes'); // 경로 데이터가 있을 때만 중심 조정
      }

      // 새로운 공간 렌더링
      if (spaceFullCoords.length > 0) {
        renderEntities(spaceFullCoords, 'spaces'); // 공간 렌더링
        fitMapToEntities(spaceFullCoords, 'spaces'); // 공간 데이터가 있을 때만 중심 조정
      }
    };

    resetAndDisplayAllEntities();
  }, [routeFullCoords, spaceFullCoords]);

  // 로그 검색 및 공간 검색 전환 시 상태 초기화
  useEffect(() => {
    if (!getCentered) {
      setCentered(false);
    }
  }, [routeFullCoords, spaceFullCoords]);

  /**
   * 지도에 엔터티(경로 및 공간)를 렌더링하는 함수
   * @param {Array} coords - 렌더링할 좌표 배열
   * @param {string} type - 엔터티 유형 ("routes" 또는 "spaces")
   */
  const renderEntities = (coords, type) => {
    clearEntities(type); // Clear previous entities

    if (!mapInstance.current || !coords) return;

    coords
      .filter((coord) => coord && checkedNode[coord.file_id] !== false) // Render if checked or undefined in `checkedNode`
      .forEach((coord, index) => {
        if (Array.isArray(coord.coords)) {
          const lineString = new H.geo.LineString();
          coord.coords.forEach((point) =>
            lineString.pushPoint({ lat: point.lat, lng: point.lng })
          );

          const polylineColor =
            routesColors.current.get(coord.file_id) ||
            routeColors[index % routeColors.length];
          routesColors.current.set(coord.file_id, polylineColor);

          const polyline = new H.map.Polyline(lineString, {
            style: { lineWidth: 5, strokeColor: polylineColor },
          });
          mapInstance.current.addObject(polyline);
          polylineRefs.current[type].push(polyline);

          const startIcon = new H.map.Icon(Start_Point, {
            size: { w: 32, h: 32 },
          });
          const endIcon = new H.map.Icon(End_Point, { size: { w: 32, h: 32 } });
          const startMarker = new H.map.Marker(coord.coords[0], {
            icon: startIcon,
          });
          const endMarker = new H.map.Marker(
            coord.coords[coord.coords.length - 1],
            { icon: endIcon }
          );

          mapInstance.current.addObject(startMarker);
          mapInstance.current.addObject(endMarker);

          markerRefs.current[type].push(startMarker, endMarker);
        }
      });

    fitMapToEntities(coords);
  };

  /**
   * 지도에서 모든 마커를 제거하는 함수
   */
  const clearMarkers = () => {
    if (markerRef.current) {
      mapInstance.current.removeObject(markerRef.current);
      markerRef.current = null; // Clear the search marker
    }

    Object.keys(markerRefs.current).forEach((key) => {
      markerRefs.current[key].forEach((marker) =>
        mapInstance.current.removeObject(marker)
      );
      markerRefs.current[key] = []; // Clear route and space markers
    });
  };

  /**
   * 이전 엔터티를 제거하는 함수
   * @param {string} type - 엔터티 유형 ("routes" 또는 "spaces")
   */
  const clearEntities = (type, clearSearchMarker = false) => {
    if (polylineRefs.current[type]) {
      polylineRefs.current[type].forEach((polyline) =>
        mapInstance.current.removeObject(polyline)
      );
      polylineRefs.current[type] = [];
    }

    if (markerRefs.current[type]) {
      markerRefs.current[type].forEach((marker) =>
        mapInstance.current.removeObject(marker)
      );
      markerRefs.current[type] = [];
    }

    if (clearSearchMarker) {
      clearMarkers();
    }
  };

  // 초기 지도 로드 및 설정
  useEffect(() => {
    renderEntities(adjustedRouteCoords, 'routes');
  }, [adjustedRouteCoords, routeColors, checkedNode]);

  useEffect(() => {
    renderEntities(adjustedSpaceCoords, 'spaces');
  }, [adjustedSpaceCoords, routeColors, checkedNode]);

  useEffect(() => {
    const initialCoords = calculateCenterAndMarker(lat, lng);
    if (
      !initialCoords ||
      isNaN(initialCoords.lat) ||
      isNaN(initialCoords.lng)
    ) {
      console.error('Invalid coordinates provided:', initialCoords);
      return;
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(); // Script already loaded
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => {
          console.error(`Failed to load script: ${src}`);
          reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
      });
    };

    const initializeMap = () => {
      if (!window.H) {
        return;
      }
      if (!apiKey) {
        return;
      }
      if (mapInstance.current) {
        return;
      }

      try {
        platformInstance.current = new H.service.Platform({ apiKey });
        const defaultLayers = platformInstance.current.createDefaultLayers();

        mapInstance.current = new H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            zoom: Number(process.env.REACT_APP_ZOOM) || 17,
            center: initialCoords,
          }
        );

        new H.mapevents.Behavior(
          new H.mapevents.MapEvents(mapInstance.current)
        );
        window.addEventListener('resize', () =>
          mapInstance.current.getViewPort().resize()
        );

        mapInstance.current.addEventListener('tap', (evt) => {
          const clickedCoords = mapInstance.current.screenToGeo(
            evt.currentPointer.viewportX,
            evt.currentPointer.viewportY
          );

          setClickedCoords(clickedCoords); // 클릭된 좌표 저장
          setDisableCentering(true); // 중심 자동 조정 비활성화

          if (typeof locationCoords === 'function') {
            locationCoords({ lat: clickedCoords.lat, lng: clickedCoords.lng });
          }
        });
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    loadScript('https://js.api.here.com/v3/3.1/mapsjs-core.js')
      .then(() =>
        loadScript('https://js.api.here.com/v3/3.1/mapsjs-service.js')
      )
      .then(() => loadScript('https://js.api.here.com/v3/3.1/mapsjs-ui.js'))
      .then(() =>
        loadScript('https://js.api.here.com/v3/3.1/mapsjs-mapevents.js')
      )
      .then(() => initializeMap())
      .catch((error) =>
        console.error('Failed to load HERE Maps API scripts:', error)
      );
  }, []);

  useEffect(() => {
    if (onClearMap && mapInstance.current) {
      // 초기 좌표 가져오기
      const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE) || 0;
      const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE) || 0;
      const defaultZoom = Number(process.env.REACT_APP_ZOOM) || 17;

      // 지도 중심 및 줌 초기화
      centerMapWithoutMarker(defaultLat, defaultLng, defaultZoom);

      // 기존 엔터티 제거
      clearEntities('routes');
      clearEntities('spaces');
      clearMarkers();

      // disableCentering을 false로 설정하여 다시 자동 중심 조정 가능
      setDisableCentering(false);
    }
  }, [onClearMap]);

  return <div ref={mapRef} style={{ height: '87.8vh' }} />;
};

export default HereMap;
