import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css';

const colors = [
  '#0000FF', // 파란색
  '#00FF00', // 초록색
  '#FF0000', // 빨간색
  '#00FFFF', // 청록색
  '#FFFF00', // 노란색
  '#FF00FF', // 자홍색
  '#0080FF', // 밝은 파란색
  '#80FF00', // 연두색
  '#ff0075', // 빨간색 비슷
  '#98ff98', // 연한 녹색
  '#FFA500', // 주황색
  '#8811FF', // 보라색
  '#8080FF', // 연한 보라색
  '#88FF80', // 밝은 연녹색
  '#ffae00', // 황금색
  '#008828', // 밝은 하늘색
  '#50664e', // 짙은 초록색
  '#790963', // 짙은 보라색
  '#32437a', // 짙은 파란색
  '#415e45', // 짙은 녹색
];

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

        console.log('center', center);
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

      setSearchMarker(newMarker); // Store the marker in state
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

      // Check if either routeFullCoords or spaceFullCoords is null or empty
      const hasValidRouteCoords =
        Array.isArray(routeFullCoords) && routeFullCoords.length > 0;
      const hasValidSpaceCoords =
        Array.isArray(spaceFullCoords) && spaceFullCoords.length > 0;

      if (!hasValidRouteCoords && !hasValidSpaceCoords) {
        console.log('No valid routes or spaces; returning to default center.');

        // Clear existing routes and markers
        clearRoutesAndMarkers(map);

        // Reset map center to default coordinates
        map.flyTo({
          center: [defaultLng, defaultLat],
          zoom: Number(process.env.REACT_APP_ZOOM),
        });

        return; // Exit effect early
      }

      // Filter valid route and space coordinates based on checkedNodes
      const validRouteCoords = hasValidRouteCoords
        ? routeFullCoords.filter(
            (route) =>
              route &&
              route.coords &&
              route.coords.length > 0 &&
              (checkedNodes.length === 0 ||
                checkedNodes.some((node) => node.file_id === route.file_id))
          )
        : [];

      const validSpaceCoords = hasValidSpaceCoords
        ? spaceFullCoords.filter(
            (space) =>
              space &&
              space.coords &&
              space.coords.length > 0 &&
              (checkedNodes.length === 0 ||
                checkedNodes.some((node) => node.file_id === space.file_id))
          )
        : [];

      // Draw routes and spaces on the map
      if (map.isStyleLoaded()) {
        drawRoutes(map, [...validRouteCoords, ...validSpaceCoords]);
      } else {
        map.once('style.load', () => {
          drawRoutes(map, [...validRouteCoords, ...validSpaceCoords]);
        });
      }
    }
  }, [routeFullCoords, spaceFullCoords, checkedNodes]);

  /**
   * 지도에서 기존 경로 레이어와 마커를 제거하는 함수
   * @param {Object} map - 지도 인스턴스
   */
  const clearRoutesAndMarkers = (map) => {
    // 경로 레이어 제거
    if (routeLayerIds.current.length > 0) {
      routeLayerIds.current.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId); // 레이어 제거
          map.removeSource(layerId); // 데이터 소스 제거
        }
      });
      routeLayerIds.current = []; // 레이어 ID 배열 초기화
    }

    // 마커 제거
    if (routeMarkers.current.length > 0) {
      routeMarkers.current.forEach((marker) => {
        marker.remove(); // 지도에서 마커 제거
      });
      routeMarkers.current = []; // 마커 배열 초기화
    }
  };

  /**
   * 이전 경로와 현재 경로를 비교하여 비활성화된 경로를 찾는 함수
   * @param {Array} previousRoutes - 이전 경로 배열
   * @param {Array} currentRoutes - 현재 경로 배열
   * @returns {Array} - 비활성화된 경로의 인덱스 배열
   */
  const findDeactivatedRoutes = (previousRoutes, currentRoutes) => {
    // 이전 경로 배열을 순회하며 비활성화된 경로의 인덱스를 확인
    const deactivatedRoutes = previousRoutes
      .map((route, index) => {
        return currentRoutes.includes(route) ? null : index; // 현재 경로에 없는 경우 인덱스 반환
      })
      .filter((index) => index !== null); // null 값 제거

    return deactivatedRoutes;
  };

  /**
   * 비활성화된 경로의 인덱스에 null을 삽입하고 필요 시 복구하는 함수
   * @param {Array} routeFullCoords - 전체 경로 배열
   * @param {Array} deactivatedRoutes - 비활성화된 경로의 인덱스 배열
   * @param {Array} removedRoutes - 복구를 위해 저장된 제거된 경로 데이터
   * @returns {Object} - { routesWithNulls, removedRoutes }
   */
  const insertNullsAtDeactivatedIndices = (
    routeFullCoords,
    deactivatedRoutes,
    removedRoutes = []
  ) => {
    let routesWithNulls = [...routeFullCoords]; // 원본 배열을 복사하여 작업

    // 비활성화된 인덱스에 null 삽입
    deactivatedRoutes.forEach((index) => {
      if (index < routesWithNulls.length) {
        // 원본 데이터를 저장하고 null 삽입
        removedRoutes.push({ index, data: routesWithNulls[index] });
        routesWithNulls.splice(index, 0, null);
      } else {
        routesWithNulls.push(null); // 배열 길이를 초과한 경우 null 추가
      }
    });

    // 복구된 데이터를 removedRoutes에서 제거하고 원래 자리로 복구
    removedRoutes.forEach(({ index, data }) => {
      if (index < routesWithNulls.length && routesWithNulls[index] === null) {
        routesWithNulls[index] = data; // null을 원래 데이터로 복구
      }
    });

    // 복구가 완료된 데이터는 removedRoutes에서 제거
    removedRoutes = removedRoutes.filter(({ index }) => {
      return routesWithNulls[index] === null; // 여전히 null인 경우만 유지
    });

    // 중복된 마지막 요소 또는 불필요한 null 제거
    if (
      routesWithNulls.length > 1 &&
      routesWithNulls[routesWithNulls.length - 1] ===
        routesWithNulls[routesWithNulls.length - 2]
    ) {
      routesWithNulls.pop(); // 중복된 마지막 요소 제거
    } else if (routesWithNulls[routesWithNulls.length - 1] === null) {
      routesWithNulls.pop(); // 불필요한 null 제거
    }

    return { routesWithNulls, removedRoutes }; // 수정된 배열과 남은 데이터 반환
  };

  /**
   * 체크된 노드 기반으로 다수의 경로를 지도에 그리는 함수
   * @param {Object} map - TomTom 지도 인스턴스
   * @param {Array} routeFullCoords - 모든 경로 객체 배열 (좌표 포함)
   */
  const drawRoutes = (map, routeFullCoords = []) => {
    // 기존 경로 및 마커를 모두 제거
    clearRoutesAndMarkers(map);

    // 지도 스타일이 로드되지 않은 경우, 로드 후에 실행되도록 설정
    if (!map.isStyleLoaded()) {
      map.once('style.load', () => {
        drawRoutes(map, routeFullCoords); // 스타일 로드 후 다시 실행
      });
      return;
    }

    // 모든 경로를 포함할 수 있는 범위를 생성
    const bounds = new tt.LngLatBounds();

    // 각 경로를 반복하며 맵에 렌더링
    routeFullCoords.forEach((route, index) => {
      if (!route || !route.coords || route.coords.length === 0) return; // 경로가 유효하지 않으면 스킵

      // 경로의 좌표를 매핑 (경도, 위도 배열로 변환)
      const coordinates = route.coords.map((coord) => [coord.lng, coord.lat]);

      // 각 좌표를 범위에 추가
      coordinates.forEach((coord) => bounds.extend(coord));

      // 시작 지점 마커 생성
      const startMarker = new tt.Marker({
        element: createCustomMarker(Start_Point), // 커스텀 마커 요소 생성
      })
        .setLngLat(coordinates[0])
        .addTo(map); // 시작 좌표에 마커 추가

      // 끝 지점 마커 생성
      const endMarker = new tt.Marker({
        element: createCustomMarker(End_Point), // 커스텀 마커 요소 생성
      })
        .setLngLat(coordinates[coordinates.length - 1])
        .addTo(map); // 끝 좌표에 마커 추가

      // 마커를 참조 배열에 저장
      routeMarkers.current.push(startMarker, endMarker);

      // 경로의 GeoJSON 객체 생성
      const geoJsonRoute = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates, // 경로 좌표
        },
      };

      // 맵에 추가할 새로운 경로 레이어 ID 생성
      const newRouteLayerId = `route-${index}-${Date.now()}`;
      routeLayerIds.current.push(newRouteLayerId);

      // 맵에 레이어 추가 (경로 시각화)
      map.addLayer({
        id: newRouteLayerId,
        type: 'line', // 라인 타입
        source: {
          type: 'geojson',
          data: geoJsonRoute, // GeoJSON 데이터 사용
        },
        paint: {
          'line-color': colors[index % colors.length], // 라인 색상 지정 (순환 색상 배열)
          'line-width': 5, // 라인 두께
        },
      });
    });

    // 유효한 경로가 있을 경우 계산된 범위에 맞게 맵 화면 조정
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 50 }); // 맵 경계를 패딩 50으로 조정
    } else {
      console.error('No valid routes to display'); // 유효한 경로가 없을 경우 에러 출력
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
    <div id="map-container" className="map" style={{ height: '87.8vh' }} />
  );
}
