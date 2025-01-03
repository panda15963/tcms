import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css';

/**
 * 중심 좌표와 마커 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 위도와 경도를 포함한 객체
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);
  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng), isDefault: false };
  }
  return { lat: defaultLat, lng: defaultLng, isDefault: true };
}

/**
 * 좌표 문자열을 파싱하여 lat 및 lng 속성을 가진 객체로 변환하는 함수
 * @param {string} coordString - "lng,lat" 형식의 좌표 문자열
 * @returns {Object|null} - {lat, lng} 객체 또는 유효하지 않은 경우 null 반환
 */
const parseCoordinateString = (coordString) => {
  const coordsArray = coordString.split(',').map(parseFloat);
  if (
    coordsArray.length === 2 &&
    !isNaN(coordsArray[0]) &&
    !isNaN(coordsArray[1])
  ) {
    return { lng: coordsArray[0], lat: coordsArray[1] }; // 유효한 경우 좌표 객체 반환
  }
  return null; // 유효하지 않은 경우 null 반환
};

/**
 * TomTomMap 컴포넌트
 * @param {number} lat - 초기 중심 좌표의 위도
 * @param {number} lng - 초기 중심 좌표의 경도
 * @param {function} locationCoords - 클릭된 좌표를 부모로 전달하는 함수
 * @param {Array} routeFullCoords - 경로 좌표 배열 (경로를 그리는 데 사용)
 * @param {Object} place - 선택된 장소 정보
 * @param {Array} checkedNodes - 선택된 노드 목록
 * @param {Object} clickedNode - 클릭된 노드 정보 (지도를 중심으로 이동)
 * @param {Array} spaceFullCoords - 공간 좌표 배열
 * @param {Array} routeColors - 경로 색상 배열
 * @param {function} onClearMap - 지도 초기화 함수
 */
export default function TomTomMap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords,
  place,
  checkedNodes,
  clickedNode,
  spaceFullCoords,
  routeColors = () => {},
  onClearMap,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 중심 마커를 참조하기 위한 ref
  const routeLayerIds = useRef([]); // 경로 레이어 ID를 저장하여 관리
  const routeMarkers = useRef([]); // 시작 및 종료 마커 저장
  const [searchMarker, setSearchMarker] = useState(null); // 검색된 마커 상태
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);
  const routesColors = useRef(new Map());

  useEffect(() => {
    routeFullCoords = []; // 경로 좌표 배열을 빈 배열로 초기화
    checkedNodes = []; // 선택된 노드 배열을 빈 배열로 초기화
    spaceFullCoords = []; // 공간 좌표 배열을 빈 배열로 초기화
    routeColors = []; // 경로 색상 배열을 빈 배열로 초기화
    clickedNode = null; // 클릭된 노드 값을 null로 초기화
    place = null; // 선택된 장소 정보를 null로 초기화
  }, []); // 빈 dependency 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  /**
   * 위도(lat)와 경도(lng)가 변경될 때 중심 좌표를 업데이트
   */
  useEffect(() => {
    setCenter(calculateCenterAndMarker(lat, lng));
  }, [lat, lng]);

  /**
   * TomTom API를 로드하고 지도를 초기화하는 useEffect
   */
  useEffect(() => {
    const initializeMap = () => {
      // TomTom 지도 초기화
      mapRef.current = tt.map({
        key: process.env.REACT_APP_TOMTOM_MAP_API, // TomTom API 키
        container: 'map-container', // 지도가 렌더링될 HTML 컨테이너 ID
        center: [center.lng, center.lat], // 초기 중심 좌표
        zoom: Number(process.env.REACT_APP_ZOOM), // 초기 줌 레벨
      });

      // 지도 클릭 이벤트 리스너 추가
      mapRef.current.on('click', (event) => {
        const { lat, lng } = event.lngLat; // 클릭된 좌표
        locationCoords({ lat, lng }); // 부모로 클릭된 좌표 전달
      });

      // 초기 마커 추가 (기본 좌표가 아닌 경우)
      if (!center.isDefault) {
        markerRef.current = new tt.Marker()
          .setLngLat([center.lng, center.lat]) // 현재 중심 좌표
          .addTo(mapRef.current); // 지도에 마커 추가
      }

      // 지도 스타일이 로드된 후 경로를 그림
      mapRef.current.on('style.load', () => {
        if (routeFullCoords) {
          drawRoutes(mapRef.current, routeFullCoords); // 초기 경로 렌더링
        }
      });
    };

    // 지도 인스턴스가 없으면 초기화
    if (!mapRef.current) {
      initializeMap();
    }
  }, [center, routeFullCoords, place]); // center, routeFullCoords, place 변경 시 업데이트

  useEffect(() => {
    if (onClearMap) {
      // 지도 중심과 줌을 기본값으로 재설정
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [defaultLng, defaultLat], // 기본 좌표로 이동
          zoom: Number(process.env.REACT_APP_ZOOM), // 기본 줌 레벨 설정
        });

        // 기존 마커와 경로 제거
        clearRoutesAndMarkers(mapRef.current);

        // 검색 마커도 초기화 (있는 경우)
        if (searchMarker) {
          searchMarker.remove(); // 기존 검색 마커 제거
          setSearchMarker(null); // 검색 마커 상태 초기화
        }
      }

      // `onClearMap` 상태를 false로 변경하여 반복 실행 방지
      if (typeof onClearMap === 'function') {
        onClearMap(false); // `onClearMap`이 상태 변경 함수인 경우
      }
    }
  }, [onClearMap]); // `onClearMap` 값이 변경될 때마다 실행

  // 검색된 위치에 마커 추가
  useEffect(() => {
    if (searchMarker) {
      searchMarker.remove();
    }

    if (lat && lng) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
      });

      const newMarker = new tt.Marker()
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      setSearchMarker(newMarker);
    } else {
      mapRef.current.flyTo({
        center: [defaultLng, defaultLat],
        zoom: Number(process.env.REACT_APP_ZOOM),
      });

      if (searchMarker) {
        searchMarker.remove();
        setSearchMarker(null);
      }
    }
  }, [lat, lng]);

  /**
   * checkedNodes 변경 시 지도에 경로 및 공간을 업데이트하는 useEffect
   */
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;

      // routeFullCoords와 spaceFullCoords가 유효한지 확인
      const hasValidRouteCoords =
        Array.isArray(routeFullCoords) && routeFullCoords.length > 0;
      const hasValidSpaceCoords =
        Array.isArray(spaceFullCoords) && spaceFullCoords.length > 0;

      // 유효한 경로와 공간이 없거나 checkedNodes가 비어있는 경우 기본 중심으로 돌아감
      if (
        (!hasValidRouteCoords && !hasValidSpaceCoords) ||
        checkedNodes.length === 0
      ) {
        // 기존 경로와 마커 제거
        clearRoutesAndMarkers(map);

        // 지도의 중심을 기본 좌표로 재설정
        map.flyTo({
          center: [defaultLng, defaultLat], // 기본 경도와 위도로 설정
          zoom: Number(process.env.REACT_APP_ZOOM), // 기본 줌 레벨로 설정
        });

        return; // 효과 조기 종료
      }

      // checkedNodes에 따라 유효한 경로 필터링
      const validRouteCoords = hasValidRouteCoords
        ? routeFullCoords.filter(
            (route) =>
              route && // 경로 객체가 유효한지 확인
              route.coords && // 좌표 데이터가 존재하는지 확인
              route.coords.length > 0 && // 좌표 배열이 비어있지 않은지 확인
              checkedNodes.some((node) => node.file_id === route.file_id) // 선택된 노드와 일치하는 경로만 필터링
          )
        : [];

      // checkedNodes에 따라 유효한 공간 필터링
      const validSpaceCoords = hasValidSpaceCoords
        ? spaceFullCoords.filter(
            (space) =>
              space && // 공간 객체가 유효한지 확인
              space.coords && // 좌표 데이터가 존재하는지 확인
              space.coords.length > 0 && // 좌표 배열이 비어있지 않은지 확인
              checkedNodes.some((node) => node.file_id === space.file_id) // 선택된 노드와 일치하는 공간만 필터링
          )
        : [];

      // 유효한 경로와 공간 데이터를 결합
      const combinedCoords = [...validRouteCoords, ...validSpaceCoords];

      // 기존 경로와 공간 제거 후 필터링된 데이터로 다시 그림
      clearRoutesAndMarkers(map);
      drawRoutes(map, combinedCoords);
    }
  }, [routeFullCoords, spaceFullCoords, checkedNodes]);

  /**
   * 지도에서 기존 경로 레이어와 마커를 제거하는 함수
   * @param {Object} map - 지도 인스턴스
   */
  const clearRoutesAndMarkers = (map) => {
    // Remove route layers
    if (routeLayerIds.current.length > 0) {
      routeLayerIds.current.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
          map.removeSource(layerId);
        }
      });
      routeLayerIds.current = [];
    }

    // Remove markers
    if (routeMarkers.current.length > 0) {
      routeMarkers.current.forEach((marker) => marker.remove());
      routeMarkers.current = [];
    }
  };

  /**
   * 체크된 노드 기반으로 다수의 경로를 지도에 그리는 함수
   * @param {Object} map - TomTom 지도 인스턴스
   * @param {Array} routeFullCoords - 모든 경로 객체 배열 (좌표 포함)
   */
  const drawRoutes = (map, routeFullCoords = []) => {
    // 비활성화된 경로 제거
    clearRoutesAndMarkers(map);

    const bounds = new tt.LngLatBounds();

    routeFullCoords.forEach((route, index) => {
      if (!route || !route.coords || route.coords.length === 0) return;

      const coordinates = route.coords.map((coord) => [coord.lng, coord.lat]);
      coordinates.forEach((coord) => bounds.extend(coord));

      // 시작 마커 및 종료 마커 추가
      const startMarker = new tt.Marker({
        element: createCustomMarker(Start_Point),
      })
        .setLngLat(coordinates[0])
        .addTo(map);

      const endMarker = new tt.Marker({
        element: createCustomMarker(End_Point),
      })
        .setLngLat(coordinates[coordinates.length - 1])
        .addTo(map);

      routeMarkers.current.push(startMarker, endMarker);

      const geoJsonRoute = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
      };

      const newRouteLayerId = `route-${index}-${Date.now()}`;
      routeLayerIds.current.push(newRouteLayerId);

      const routeColor =
        routesColors.current.get(route.file_id) ||
        routeColors[index % routeColors.length];
      routesColors.current.set(route.file_id, routeColor);
      map.addLayer({
        id: newRouteLayerId,
        type: 'line',
        source: {
          type: 'geojson',
          data: geoJsonRoute,
        },
        paint: {
          'line-color': routeColor,
          'line-width': 5,
        },
      });
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 });
    } else {
      console.error('No valid routes to display');
    }
  };

  /**
   * 커스텀 마커를 생성하는 헬퍼 함수
   * @param {string} icon - 마커에 사용할 아이콘의 URL
   * @returns {HTMLElement} - 커스텀 마커 요소
   */
  const createCustomMarker = (icon) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    const img = document.createElement('img');
    img.src = icon;
    img.style.width = '32px'; // 마커 너비 설정
    img.style.height = '32px'; // 마커 높이 설정
    markerElement.appendChild(img);
    return markerElement;
  };

  /**
   * 경로의 시작점과 종료점을 기반으로 지도를 중심으로 설정하는 함수
   * @param {Object} map - TomTom 지도 인스턴스
   * @param {Object} originCoords - 시작점 좌표 {lat, lng}
   * @param {Object} destinationCoords - 종료점 좌표 {lat, lng}
   */
  const centerRoute = (map, originCoords, destinationCoords) => {
    const bounds = new tt.LngLatBounds();

    // 범위에 시작점과 종료점 추가
    bounds.extend([originCoords.lng, originCoords.lat]);
    bounds.extend([destinationCoords.lng, destinationCoords.lat]);

    // 경로의 범위에 맞게 지도 조정
    map.fitBounds(bounds, { padding: 50 });
  };

  /**
   * 클릭된 노드를 처리하고 지도 중심을 설정하는 useEffect
   */
  useEffect(() => {
    if (clickedNode != null && mapRef.current) {
      // 노드의 시작점과 종료점 좌표 파싱
      const originCoords = parseCoordinateString(clickedNode.start_coord);
      const destinationCoords = parseCoordinateString(clickedNode.goal_coord);

      if (originCoords && destinationCoords) {
        // 시작점과 종료점 좌표를 기반으로 지도 중심 설정
        centerRoute(mapRef.current, originCoords, destinationCoords);
      } else {
        console.error(
          'Invalid origin or destination coordinates for clicked node.'
        );
      }
    }
  }, [clickedNode]);

  return (
    <div id="map-container" className="map" style={{ height: `calc(100vh - 102px)`, zIndex: '1' }} />
  );
}
