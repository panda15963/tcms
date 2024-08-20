import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css';

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
 * TomTomMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function TomTomMap({ lat, lng, locationCoords = () => {} }) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref

  // lat와 lng가 변경될 때마다 중심 좌표 업데이트
  useEffect(() => {
    setCenter(calculateCenterAndMarker(lat, lng));
  }, [lat, lng]);

  // TomTom API 로드 및 지도 초기화
  useEffect(() => {
    /**
     * TomTom 지도 SDK 스크립트를 동적으로 로드하는 함수
     */
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.14.0/maps/maps-web.min.js'; // TomTom API 스크립트 경로
      script.async = true; // 비동기 로드 설정
      script.onload = initializeMap; // 스크립트 로드 완료 후 지도 초기화
      document.body.appendChild(script); // 스크립트를 body에 추가하여 비동기 로드
    };

    /**
     * 지도를 초기화하고 클릭 이벤트 및 마커를 설정하는 함수
     */
    const initializeMap = () => {
      mapRef.current = tt.map({
        key: process.env.REACT_APP_TOMTOM_MAP_API, // 환경 변수에서 TomTom API 키 가져오기
        container: 'map-container', // 지도가 렌더링될 HTML 요소 ID
        center: [center.lng, center.lat], // 초기 중심 좌표 설정
        zoom: Number(process.env.REACT_APP_ZOOM), // 환경 변수에서 줌 레벨 가져오기
      });

      // 지도 클릭 이벤트 리스너 추가
      mapRef.current.on('click', (event) => {
        const { lat, lng } = event.lngLat; // 클릭한 위치의 위도 및 경도
        locationCoords({ lat, lng }); // 부모 컴포넌트로 좌표 전달
      });

      // 초기 마커 설정
      markerRef.current = new tt.Marker()
        .setLngLat([center.lng, center.lat]) // 마커 위치 설정
        .addTo(mapRef.current); // 마커를 지도에 추가
    };

    // TomTom API가 로드되지 않았으면 스크립트 로드
    if (!window.tt) {
      loadScript();
    } else {
      initializeMap(); // 이미 API가 로드된 경우 지도 초기화
    }
  }, []);

  // 지도 중심이 변경될 때마다 지도와 마커 위치 업데이트
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setCenter([center.lng, center.lat]); // 지도 중심 위치 업데이트
      markerRef.current.setLngLat([center.lng, center.lat]); // 마커 위치 업데이트
    }
  }, [center]);

  // 지도 DOM 요소 렌더링
  return (
    <div>
      <div id="map-container" className="map"></div> {/* 지도 컨테이너 */}
    </div>
  );
}
