import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg';
import Start_Point from '../../assets/images/multi_start_point.svg';
import '../../style/MapStyle.css';

/**
 * 좌표 문자열을 파싱하여 객체로 변환하는 함수
 * @param {string} coordString - "lng,lat" 형식의 좌표 문자열
 * @returns {Object} - { lat, lng } 형식의 좌표 객체
 */
function parseCoordinates(coordString) {
  const [lng, lat] = coordString.split(',').map(Number); // 문자열을 분리하고 숫자로 변환
  return { lat, lng };
}

/**
 * 단일 좌표 또는 여러 좌표를 처리하는 함수
 * @param {Array|string} input - 좌표 배열 또는 좌표 문자열
 * @returns {Array} - 처리된 { lat, lng } 형식의 좌표 배열
 */
function handleCoordinateInput(input) {
  if (Array.isArray(input)) {
    return input
      .map((coord) => {
        if (
          typeof coord === 'object' &&
          coord.lat != null &&
          coord.lng != null
        ) {
          return coord; // 유효한 {lat, lng} 객체 반환
        } else if (typeof coord === 'string') {
          return parseCoordinates(coord); // 문자열을 파싱
        } else {
          console.error('Invalid coordinate format:', coord);
          return null; // 유효하지 않은 경우 null 반환
        }
      })
      .filter((coord) => coord !== null); // 유효하지 않은 좌표 필터링
  }
  return []; // 유효하지 않은 입력일 경우 빈 배열 반환
}

/**
 * TMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE); // 기본 위도 값
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE); // 기본 경도 값

  const parsedLat = parseFloat(lat); // 위도 값 파싱
  const parsedLng = parseFloat(lng); // 경도 값 파싱

  return {
    lat: !isNaN(parsedLat) ? parsedLat : defaultLat,
    lng: !isNaN(parsedLng) ? parsedLng : defaultLng,
    isDefault: isNaN(parsedLat) && isNaN(parsedLng), // 기본 좌표 여부 확인
  };
}

/**
 * Tmap 컴포넌트
 * @param {number} lat - 지도 초기 중심의 위도
 * @param {number} lng - 지도 초기 중심의 경도
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하는 함수
 * @param {Array} routeFullCoords - 경로의 전체 좌표 목록
 * @param {Array} spaceFullCoords - 공간의 전체 좌표 목록
 * @param {Array} checkedNodes - 선택된 노드 목록
 * @param {Object} clickedNode - 클릭된 노드의 정보
 * @param {Object} searchedLocation - 검색된 위치의 좌표
 * @param {Array} routeColors - 경로 색상의 배열
 * @param {function} onClearMap - 지도를 초기화하는 함수
 * @param {string} selectedAPI - 선택된 API 키
 */
export default function Tmap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords,
  spaceFullCoords,
  checkedNodes,
  clickedNode,
  searchedLocation,
  routeColors = () => {},
  onClearMap,
  selectedAPI,
}) {
  const routesColors = useRef(new Map());
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 상태 관리
  const [shouldResetMap, setShouldResetMap] = useState(false);

  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 중심 마커를 참조하기 위한 ref

  const routeMarkerRef = useRef([]); // 경로 마커를 참조하기 위한 ref
  const spaceMarkerRef = useRef([]); // 공간 마커를 참조하기 위한 ref
  const routePolylineRef = useRef([]); // 경로 폴리라인을 참조하기 위한 ref
  const spacePolylineRef = useRef([]); // 공간 폴리라인을 참조하기 위한 ref
  const initialCoordsRef = useRef(initialCoords); // 초기 중심 좌표를 저장하는 useRef

  useEffect(() => {
    routeFullCoords = []; // 경로 좌표 배열을 빈 배열로 초기화
    checkedNodes = []; // 선택된 노드 배열을 빈 배열로 초기화
    spaceFullCoords = []; // 공간 좌표 배열을 빈 배열로 초기화
    routeColors = []; // 경로 색상 배열을 빈 배열로 초기화
    clickedNode = null; // 클릭된 노드 값을 null로 초기화
  }, []); // 빈 dependency 배열로 설정하여 컴포넌트 마운트 시 한 번만 실행

  /**
   * 위도와 경도가 변경될 때 지도의 중심 좌표를 업데이트하는 useEffect
   */
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng); // 새로운 중심 좌표 계산
    setCenter(newCenter); // 상태 업데이트
  }, [lat, lng]);

  /**
   * TMap 스크립트를 로드하고 지도를 초기화하는 useEffect
   */
  useEffect(() => {
    // 환경 변수에 TMAP API 키가 설정되어 있는지 확인
    if (!selectedAPI) {
      console.error('TMAP API 키가 누락되었습니다!'); // API 키가 없을 경우 오류 출력
      return; // 실행 중단
    }

    initMap(); // Tmapv2 객체가 이미 로드된 경우 지도 초기화 함수 호출
  }, []); // 의존성 배열을 비워두어 컴포넌트가 마운트될 때 한 번만 실행

  /**
   * `center` 상태가 변경될 때 지도 중심과 마커를 업데이트하는 useEffect
   */
  useEffect(() => {
    if (mapRef.current) {
      updateMapCenter(); // 지도 중심 업데이트
    }
  }, [center]);

  /**
   * 검색된 위치가 변경될 때 지도 중심을 업데이트하는 useEffect
   */
  useEffect(() => {
    if (searchedLocation && mapRef.current) {
      const { lat: searchedLat, lng: searchedLng } = searchedLocation; // 검색된 좌표 추출
      const newCenter = new window.Tmapv2.LatLng(searchedLat, searchedLng); // 새 중심 생성
      mapRef.current.setCenter(newCenter); // 지도 중심 업데이트
      mapRef.current.setZoom(process.env.REACT_APP_ZOOM); // 줌 레벨 설정 (옵션)
    }
  }, [searchedLocation]);

  /**
   * 클릭된 노드 정보가 변경될 때 지도 중심을 업데이트하는 useEffect
   */
  useEffect(() => {
    if (clickedNode && mapRef.current) {
      const { start_coord, goal_coord } = clickedNode;

      if (start_coord && goal_coord) {
        // 시작 좌표와 도착 좌표를 파싱
        const { lat: startLat, lng: startLng } = parseCoordinates(start_coord);
        const { lat: goalLat, lng: goalLng } = parseCoordinates(goal_coord);

        // 중간 지점 계산
        const midLat = (startLat + goalLat) / 2;
        const midLng = (startLng + goalLng) / 2;

        // 중간 좌표를 지도 중심으로 설정
        const midLocation = new window.Tmapv2.LatLng(midLat, midLng);
        mapRef.current.setCenter(midLocation); // 지도 중심 설정
        mapRef.current.setZoom(12); // 줌 레벨 설정 (옵션)
      }
    }
  }, [clickedNode]);

  /**
   * 경로 데이터를 가져와 지도에 업데이트하는 useEffect
   */
  useEffect(() => {
    async function fetchRoutesAndUpdateMap() {
      const { Tmapv2 } = window;

      if (!Tmapv2 || !mapRef.current) {
        return;
      }

      // 기존 마커와 폴리라인 제거
      if (routeMarkerRef.current.length) {
        routeMarkerRef.current.forEach((marker) => marker.setMap(null));
        routeMarkerRef.current = [];
      }
      if (routePolylineRef.current.length) {
        routePolylineRef.current.forEach((polyline) => polyline.setMap(null));
        routePolylineRef.current = [];
      }

      // 모든 경로가 선택 해제된 경우 초기화
      if (checkedNodes.length === 0) {
        setShouldResetMap(true);
      } else {
        setShouldResetMap(false); // 초기화 불필요
      }

      if (!routeFullCoords || !Array.isArray(routeFullCoords)) {
        return;
      }

      let bounds = new Tmapv2.LatLngBounds();
      let selectedRouteCount = 0;

      routeFullCoords.forEach((route, index) => {
        const nodeChecked = checkedNodes.some(
          (node) => node.file_id === route.file_id
        );
        if (!nodeChecked) return;

        selectedRouteCount++;
        const parsedCoords = handleCoordinateInput(route.coords);
        if (parsedCoords.length === 0) return;

        parsedCoords.forEach((coord) => {
          bounds.extend(new Tmapv2.LatLng(coord.lat, coord.lng));
        });

        const startCoord = parsedCoords[0];
        const finishCoord = parsedCoords[parsedCoords.length - 1];

        // 시작 마커 추가
        const startMarker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(startCoord.lat, startCoord.lng),
          map: mapRef.current,
          icon: Start_Point,
          iconSize: new Tmapv2.Size(32, 32),
        });
        routeMarkerRef.current.push(startMarker);

        // 끝 마커 추가
        const finishMarker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(finishCoord.lat, finishCoord.lng),
          map: mapRef.current,
          icon: End_Point,
          iconSize: new Tmapv2.Size(32, 32),
        });
        routeMarkerRef.current.push(finishMarker);

        const color =
          routesColors.current.get(route.file_id) ||
          routeColors[index % routeColors.length];
        routesColors.current.set(route.file_id, color);

        const polylinePath = parsedCoords.map(
          (coord) => new Tmapv2.LatLng(coord.lat, coord.lng)
        );
        // 폴리라인 생성
        const polyline = new Tmapv2.Polyline({
          path: polylinePath,
          strokeColor: color,
          strokeWeight: 5,
          map: mapRef.current,
        });
        routePolylineRef.current.push(polyline);
      });

      if (!bounds.isEmpty()) {
        if (selectedRouteCount === 1) {
          mapRef.current.fitBounds(bounds);
          mapRef.current.setZoom(12);
        } else {
          mapRef.current.fitBounds(bounds);
        }
      }
    }

    fetchRoutesAndUpdateMap();
  }, [routeFullCoords, checkedNodes]);

  useEffect(() => {
    if (shouldResetMap && onClearMap) {
      resetMapToInitial(); // 초기화 실행
    }
  }, [shouldResetMap, onClearMap]);

  /**
   * 지도를 초기화하고 원래 좌표로 되돌리는 함수
   */
  function resetMapToInitial() {
    const { Tmapv2 } = window;
    if (mapRef.current && Tmapv2) {
      const defaultCenter = new Tmapv2.LatLng(
        initialCoordsRef.current.lat,
        initialCoordsRef.current.lng
      );
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(Number(process.env.REACT_APP_ZOOM));
    }
  }

  /**
   * 공간 데이터를 가져와 지도에 업데이트하는 useEffect
   */
  useEffect(() => {
    async function fetchSpacesAndUpdateMap() {
      const { Tmapv2 } = window;

      if (!Tmapv2 || !mapRef.current) {
        console.error('Tmapv2 or mapRef not available');
        return;
      }

      // 기존 마커 및 폴리라인 제거
      spaceMarkerRef.current.forEach((marker) => marker.setMap(null));
      spaceMarkerRef.current = [];
      spacePolylineRef.current.forEach((polyline) => polyline.setMap(null));
      spacePolylineRef.current = [];

      // 데이터 검증
      if (!spaceFullCoords || !Array.isArray(spaceFullCoords)) {
        return;
      }

      const bounds = new Tmapv2.LatLngBounds(); // 경계 설정
      let selectedRouteCount = 0;

      spaceFullCoords.forEach((space, index) => {
        const spaceChecked = checkedNodes.some(
          (node) => node.file_id === space.file_id
        );
        if (!spaceChecked) return;

        selectedRouteCount++;

        const parsedCoords = handleCoordinateInput(space.coords);
        if (parsedCoords.length === 0) {
          console.error('Parsed coordinates are empty for space:', space);
          return;
        }

        // 경계 확장
        parsedCoords.forEach((coord) => {
          bounds.extend(new Tmapv2.LatLng(coord.lat, coord.lng));
        });

        const startCoord = parsedCoords[0];
        const finishCoord = parsedCoords[parsedCoords.length - 1];

        // 시작 마커 추가
        const startMarker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(startCoord.lat, startCoord.lng),
          map: mapRef.current,
          icon: Start_Point,
          iconSize: new Tmapv2.Size(32, 32),
        });
        spaceMarkerRef.current.push(startMarker);

        // 끝 마커 추가
        const finishMarker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(finishCoord.lat, finishCoord.lng),
          map: mapRef.current,
          icon: End_Point,
          iconSize: new Tmapv2.Size(32, 32),
        });
        spaceMarkerRef.current.push(finishMarker);

        // 폴리라인 추가
        const color =
          routesColors.current.get(space.file_id) ||
          routeColors[index % routeColors.length];
        routesColors.current.set(space.file_id, color);

        const polylinePath = parsedCoords.map(
          (coord) => new Tmapv2.LatLng(coord.lat, coord.lng)
        );
        const polyline = new Tmapv2.Polyline({
          path: polylinePath,
          strokeColor: color,
          strokeWeight: 5,
          map: mapRef.current,
        });
        spacePolylineRef.current.push(polyline);
      });

      if (!bounds.isEmpty()) {
        if (selectedRouteCount === 1) {
          mapRef.current.fitBounds(bounds);
          mapRef.current.setZoom(14); // 세부 줌 레벨 설정
        } else {
          mapRef.current.fitBounds(bounds);
        }
      } else {
        console.warn('Bounds are empty after processing spaces');
      }
    }

    fetchSpacesAndUpdateMap();
  }, [spaceFullCoords, checkedNodes]);

  /**
   * 지도의 중심 좌표와 마커를 업데이트하는 함수
   */
  function updateMapCenter() {
    const { Tmapv2 } = window; // Tmapv2 객체 확인
    if (mapRef.current && Tmapv2) {
      // 지도 중심 좌표 업데이트
      mapRef.current.setCenter(new Tmapv2.LatLng(center.lat, center.lng));

      // 기본 좌표를 사용하는 경우 기존 마커 제거
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      if (!center.isDefault) {
        // 기본 좌표가 아닌 경우 새로운 마커 추가
        markerRef.current = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(center.lat, center.lng), // 현재 중심 좌표
          map: mapRef.current, // 지도에 마커 추가
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // 마커 아이콘 설정
          iconSize: new Tmapv2.Size(32, 32), // 마커 크기 설정
        });
      }
    }
  }

  /**
   * 지도를 초기화하는 함수
   */
  function initMap() {
    if (mapRef.current) {
      // 지도 인스턴스가 이미 초기화된 경우
      updateMapCenter(); // 중심 좌표와 마커를 업데이트
      return; // 함수 종료
    }

    const { Tmapv2 } = window; // Tmapv2 객체 확인
    mapRef.current = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(center.lat, center.lng), // 지도 초기화 시 중심 좌표 설정
      zoom: Number(process.env.REACT_APP_ZOOM), // 초기 줌 레벨 설정
    });

    // 지도 클릭 이벤트 리스너 추가
    mapRef.current.addListener('click', (evt) => {
      const clickedLat = evt.latLng.lat(); // 클릭한 위치의 위도
      const clickedLng = evt.latLng.lng(); // 클릭한 위치의 경도
      locationCoords({ lat: clickedLat, lng: clickedLng }); // 부모로 클릭한 좌표 전달
    });

    updateMapCenter(); // 초기 중심 마커 설정
  }

  return (
    <div
      id="map_div"
      className="map"
      style={{ height: `calc(100vh - 102px)`, zIndex: '1' }}
    />
  );
}
