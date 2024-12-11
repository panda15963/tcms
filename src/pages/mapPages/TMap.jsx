import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css'; // Ensure this CSS file exists

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
        if (typeof coord === 'object' && 'lat' in coord && 'lng' in coord) {
          return coord; // 유효한 lat 및 lng 속성을 가진 객체일 경우 그대로 반환
        } else if (typeof coord === 'string') {
          return parseCoordinates(coord); // 문자열일 경우 좌표로 변환
        } else {
          return null; // 유효하지 않은 경우 null 반환
        }
      })
      .filter((coord) => coord !== null); // 유효하지 않은 좌표를 필터링
  } else {
    console.error('좌표 배열 또는 문자열이 필요합니다:', input);
    return []; // 유효하지 않은 입력일 경우 빈 배열 반환
  }
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

  const parsedLat = parseFloat(lat); // Convert lat to a number
  const parsedLng = parseFloat(lng); // Convert lng to a number

  return {
    lat: !isNaN(parsedLat) ? parsedLat : defaultLat,
    lng: !isNaN(parsedLng) ? parsedLng : defaultLng,
    isDefault: isNaN(parsedLat) && isNaN(parsedLng), // 기본 좌표 여부 확인
  };
}

/**
 * RoutoMap 컴포넌트
 * @param {number} lat - 지도 초기 중심의 위도
 * @param {number} lng - 지도 초기 중심의 경도
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하는 함수
 * @param {Array} routeFullCoords - 경로의 전체 좌표 목록
 * @param {Array} spaceFullCoords - 공간의 전체 좌표 목록
 * @param {Array} checkedNodes - 선택된 노드 목록
 * @param {Object} clickedNode - 클릭된 노드의 정보
 * @param {Object} searchedLocation - 검색된 위치의 좌표
 * @param {Array} routeColors - 경로 색상의 배열
 */
export default function RoutoMap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords,
  spaceFullCoords,
  checkedNodes,
  clickedNode,
  searchedLocation,
  routeColors = [],
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 상태 관리

  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 중심 마커를 참조하기 위한 ref
  const zoomSetRef = useRef(false); // 줌 설정 상태 추적

  const startMarkerRef = useRef([]); // 여러 시작 마커를 위한 ref
  const finishMarkerRef = useRef([]); // 여러 종료 마커를 위한 ref
  const spaceMarkerRef = useRef([]); // 공간 마커를 참조하기 위한 ref
  const routePolylineRef = useRef([]); // Polylines for routes
  const spacePolylineRef = useRef([]); // Polylines for spaces

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
    if (!window.Tmapv2) {
      const scriptUrl = `https://api2.sktelecom.com/tmap/djs?version=1&appKey=${process.env.REACT_APP_TMAP_API}`;
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        initMap(); // 지도 초기화 함수 호출
      };
      script.onerror = () => {
        console.error('TMap 스크립트 로드 실패:', scriptUrl);
      };
      document.body.appendChild(script);
    } else {
      initMap(); // TMap 객체가 이미 로드된 경우 지도 초기화
    }
  }, []);

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
      mapRef.current.setZoom(10); // 줌 레벨 설정 (옵션)
    }
  }, [searchedLocation]);

  /**
   * 클릭된 노드 정보가 변경될 때 지도 중심을 업데이트하는 useEffect
   */
  useEffect(() => {
    if (clickedNode && mapRef.current) {
      const { start_coord, goal_coord } = clickedNode;

      if (start_coord && goal_coord) {
        const { lat: startLat, lng: startLng } = parseCoordinates(start_coord); // 시작 좌표 파싱
        const startLocation = new window.Tmapv2.LatLng(startLat, startLng); // 시작 좌표로 중심 생성
        mapRef.current.setCenter(startLocation); // 지도 중심 설정
        mapRef.current.setZoom(10); // 줌 레벨 설정 (옵션)
      }
    }
  }, [clickedNode]);

  /**
   * 경로 데이터를 가져와 지도에 업데이트하는 useEffect
   */
  useEffect(() => {
    async function fetchRoutesAndUpdateMap() {
      const { Tmapv2 } = window;

      // 기존 경로 마커와 폴리라인 삭제
      startMarkerRef.current.forEach((marker) => marker.setMap(null));
      finishMarkerRef.current.forEach((marker) => marker.setMap(null));
      routePolylineRef.current.forEach((polyline) => polyline.setMap(null));

      // ref 초기화
      startMarkerRef.current = [];
      finishMarkerRef.current = [];
      routePolylineRef.current = [];

      if (!routeFullCoords || routeFullCoords.length === 0) {
        const defaultCenter = new Tmapv2.LatLng(
          parseFloat(process.env.REACT_APP_LATITUDE),
          parseFloat(process.env.REACT_APP_LONGITUDE)
        );
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(10);
        return;
      }

      // 선택된 경로를 위한 새로운 경계(bounds) 생성
      let bounds = new Tmapv2.LatLngBounds();

      if (routeFullCoords && Array.isArray(routeFullCoords)) {
        routeFullCoords.forEach((route, index) => {
          // 경로가 선택되었는지 확인
          const nodeChecked = checkedNodes.some(
            (node) => node.file_id === route.file_id
          );
          if (!nodeChecked) return;

          // 선택된 경로의 좌표를 파싱
          const parsedCoords = handleCoordinateInput(route.coords);
          if (parsedCoords.length === 0) return;

          // 좌표를 경계(bounds)에 추가
          parsedCoords.forEach((coord) => {
            bounds.extend(new Tmapv2.LatLng(coord.lat, coord.lng));
          });

          const startCoord = parsedCoords[0]; // 경로 시작 좌표
          const finishCoord = parsedCoords[parsedCoords.length - 1]; // 경로 끝 좌표

          // 시작 마커 생성
          const startMarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(startCoord.lat, startCoord.lng),
            map: mapRef.current,
            icon: Start_Point,
            iconSize: new Tmapv2.Size(32, 32),
          });
          startMarkerRef.current.push(startMarker);

          // 끝 마커 생성
          const finishMarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(finishCoord.lat, finishCoord.lng),
            map: mapRef.current,
            icon: End_Point,
            iconSize: new Tmapv2.Size(32, 32),
          });
          finishMarkerRef.current.push(finishMarker);

          // 경로를 표시하는 폴리라인 생성
          const color = routeColors[index % routeColors.length] || '#ff0000';
          const polylinePath = parsedCoords.map(
            (coord) => new Tmapv2.LatLng(coord.lat, coord.lng)
          );
          const polyline = new Tmapv2.Polyline({
            path: polylinePath,
            strokeColor: color,
            strokeWeight: 5,
            map: mapRef.current,
          });
          routePolylineRef.current.push(polyline);
        });

        // 선택된 경로에 맞게 지도 보기 조정
        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds); // 항상 선택된 경로에 맞게 지도를 조정
        } else {
          console.warn('선택된 경로가 없거나 유효한 좌표를 찾을 수 없습니다.');
        }
      }
    }

    if (routeFullCoords) {
      fetchRoutesAndUpdateMap();
    }
  }, [routeFullCoords, checkedNodes]);

  /**
   * 공간 데이터를 가져와 지도에 업데이트하는 useEffect
   */
  useEffect(() => {
    async function fetchSpacesAndUpdateMap() {
      const { Tmapv2 } = window;

      // 기존에 추가된 마커와 폴리라인 제거
      if (spaceMarkerRef.current.length) {
        spaceMarkerRef.current.forEach((marker) => marker.setMap(null));
        spaceMarkerRef.current = [];
      }
      if (spacePolylineRef.current.length) {
        spacePolylineRef.current.forEach((polyline) => polyline.setMap(null));
        spacePolylineRef.current = [];
      }

      if (!spaceFullCoords || spaceFullCoords.length === 0) {
        const defaultCenter = new Tmapv2.LatLng(
          parseFloat(process.env.REACT_APP_LATITUDE),
          parseFloat(process.env.REACT_APP_LONGITUDE)
        );
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(17);
        return;
      }

      // spaceFullCoords가 null이거나 배열이 아니면 함수 종료
      if (!spaceFullCoords || !Array.isArray(spaceFullCoords)) {
        console.warn(
          'spaceFullCoords가 null이거나 배열이 아닙니다. 모든 공간 데이터가 제거되었습니다.'
        );
        return;
      }

      const newColors = []; // 새롭게 추가된 색상을 저장할 배열

      // spaceFullCoords 데이터를 처리
      spaceFullCoords.forEach((space, index) => {
        // 해당 공간이 체크 상태인지 확인
        const spaceChecked = checkedNodes.some(
          (node) => node.file_id === space.file_id
        );
        if (!spaceChecked) return; // 체크되지 않은 공간은 스킵

        // 공간 좌표를 파싱
        const parsedCoords = handleCoordinateInput(space.coords);
        if (parsedCoords.length === 0) {
          console.warn('유효한 좌표가 없습니다.'); // 유효하지 않은 좌표에 대한 경고
          return;
        }

        // 시작 좌표와 끝 좌표 설정
        const startCoord = parsedCoords[0]; // 시작 좌표
        const finishCoord = parsedCoords[parsedCoords.length - 1]; // 끝 좌표

        // 시작 마커 추가
        const startMarker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(startCoord.lat, startCoord.lng),
          map: mapRef.current,
          icon: Start_Point, // 시작 마커 아이콘
          iconSize: new Tmapv2.Size(32, 32),
        });
        spaceMarkerRef.current.push(startMarker);

        // 끝 마커 추가
        const finishMarker = new Tmapv2.Marker({
          position: new Tmapv2.LatLng(finishCoord.lat, finishCoord.lng),
          map: mapRef.current,
          icon: End_Point, // 끝 마커 아이콘
          iconSize: new Tmapv2.Size(32, 32),
        });
        spaceMarkerRef.current.push(finishMarker);

        // 폴리라인 색상 설정
        const color = routeColors[index % routeColors.length] || '#0000ff';
        newColors.push(color);

        // 폴리라인 생성
        const polylinePath = parsedCoords.map(
          (coord) => new Tmapv2.LatLng(coord.lat, coord.lng)
        );
        const polyline = new Tmapv2.Polyline({
          path: polylinePath,
          strokeColor: color, // 폴리라인 색상
          strokeWeight: 5, // 폴리라인 두께
          map: mapRef.current,
        });
        spacePolylineRef.current.push(polyline);
      });

      // 맵의 줌과 센터 위치 업데이트
      let latSum = 0;
      let lngSum = 0;
      let pointCount = 0;

      spaceFullCoords.forEach((space) => {
        space.coords.forEach(({ lat, lng }) => {
          latSum += lat;
          lngSum += lng;
          pointCount++;
        });
      });

      if (pointCount > 0) {
        const avgLat = latSum / pointCount; // 모든 좌표의 평균 위도 계산
        const avgLng = lngSum / pointCount; // 모든 좌표의 평균 경도 계산
        const centerCoords = new Tmapv2.LatLng(avgLat, avgLng);
        mapRef.current.setCenter(centerCoords); // 맵의 중심 좌표 설정

        // 맵의 줌 레벨을 한 번만 설정
        if (!zoomSetRef.current) {
          mapRef.current.setZoom(10);
          zoomSetRef.current = true;
        }
      }
    }

    fetchSpacesAndUpdateMap();
  }, [spaceFullCoords, checkedNodes]); // spaceFullCoords와 checkedNodes가 변경될 때마다 실행

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
      center: new Tmapv2.LatLng(center.lat, center.lng), // 초기 중심 좌표 설정
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

  return <div id="map_div" className="map" style={{ height: '87.8vh' }} />;
}
