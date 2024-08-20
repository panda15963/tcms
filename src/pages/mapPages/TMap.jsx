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
 * TMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function TMap({ lat, lng, locationCoords = () => {} }) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref

  // lat와 lng가 변경될 때마다 지도 중심 좌표 업데이트
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  // TMap 스크립트 로드 및 지도 초기화
  useEffect(() => {
    // TMap API가 로드되지 않은 경우, 스크립트를 동적으로 추가
    if (!window.Tmapv2) {
      const scriptUrl = `https://api2.sktelecom.com/tmap/djs?version=1&appKey=${process.env.REACT_APP_TMAP_API}`;
      console.log('Loading script:', scriptUrl);

      const script = document.createElement('script');
      script.src = scriptUrl; // TMap API 스크립트 URL 설정
      script.async = true; // 비동기 로드 설정
      script.onload = () => {
        console.log('Tmap script loaded');
        initMap(); // 스크립트 로드 완료 시 지도 초기화
      };
      script.onerror = () => {
        console.error('Failed to load Tmap script from URL:', scriptUrl); // 스크립트 로드 실패 시 에러 출력
      };
      document.body.appendChild(script); // 스크립트를 body에 추가하여 로드 시작
    } else {
      initMap(); // 이미 API가 로드된 경우 바로 지도 초기화
    }
  }, []);

  // 지도 중심 좌표가 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (mapRef.current) {
      updateMapCenter(); // 지도 중심 및 마커 업데이트
    }
  }, [center]);

  /**
   * 지도 초기화 함수
   * 지도 인스턴스를 생성하고 클릭 이벤트 리스너를 추가
   */
  function initMap() {
    if (mapRef.current) return; // 이미 초기화된 경우 종료

    const { Tmapv2 } = window; // TMap API 참조
    mapRef.current = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(center.lat, center.lng), // 초기 중심 좌표 설정
      zoom: Number(process.env.REACT_APP_ZOOM), // 환경 변수에서 줌 레벨 가져오기
    });

    // 지도 클릭 이벤트 리스너 추가
    mapRef.current.addListener('click', (evt) => {
      const clickedLat = evt.latLng.lat(); // 클릭한 위치의 위도
      const clickedLng = evt.latLng.lng(); // 클릭한 위치의 경도
      locationCoords({ lat: clickedLat, lng: clickedLng }); // 부모 컴포넌트로 좌표 전달
    });

    updateMapCenter(); // 초기 마커 설정
  }

  /**
   * 지도 중심을 업데이트하고 마커를 지도에 추가하는 함수
   */
  function updateMapCenter() {
    const { Tmapv2 } = window; // TMap API 참조
    if (mapRef.current && Tmapv2) {
      mapRef.current.setCenter(new Tmapv2.LatLng(center.lat, center.lng)); // 지도 중심 좌표 업데이트

      // 기존 마커가 있으면 제거
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // 새로운 마커를 지도에 추가
      markerRef.current = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(center.lat, center.lng), // 마커 위치 설정
        map: mapRef.current, // 마커를 추가할 지도 인스턴스 설정
      });
    }
  }

  // 지도 DOM 요소 렌더링
  return <div id="map_div" className="map" />;
}
