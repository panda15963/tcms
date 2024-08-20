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
 * RoutoMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function RoutoMap({ lat, lng, locationCoords = () => {} }) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref

  // 지도 스크립트 로드 및 초기화
  useEffect(() => {
    /**
     * Routo 지도 API 스크립트를 동적으로 로드하는 함수
     */
    const loadScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.routo.com/v2/maps/map?key=' +
        process.env.REACT_APP_ROUTTO_MAP_API; // 환경 변수에서 Routo API 키를 가져와 스크립트 로드
      script.async = true;
      script.onload = () => {
        // 스크립트 로드 후 지도와 마커 초기화
        mapRef.current = new routo.maps.Map('map', {
          center: {
            lat: center.lat,
            lng: center.lng,
          },
          zoom: Number(process.env.REACT_APP_ZOOM), // 환경 변수에서 줌 레벨 가져오기
        });

        markerRef.current = new routo.maps.Marker({
          position: {
            lat: center.lat,
            lng: center.lng,
          },
          map: mapRef.current, // 마커를 추가할 지도 인스턴스 설정
        });

        // 지도 클릭 이벤트 리스너 추가
        mapRef.current.addListener('click', (event) => {
          const clickedLat = event.latLng.lat(); // 클릭한 위치의 위도
          const clickedLng = event.latLng.lng(); // 클릭한 위치의 경도
          locationCoords({ lat: clickedLat, lng: clickedLng }); // 부모 컴포넌트로 좌표 전달
        });
      };
      document.body.appendChild(script); // 스크립트를 body에 추가하여 비동기 로드
    };

    // Routo API가 아직 로드되지 않았으면 스크립트 로드
    if (!window.routo) {
      loadScript();
    } else {
      // 이미 API가 로드된 경우 지도와 마커 초기화
      mapRef.current = new routo.maps.Map('map', {
        center: {
          lat: center.lat,
          lng: center.lng,
        },
        zoom: Number(process.env.REACT_APP_ZOOM),
      });

      markerRef.current = new routo.maps.Marker({
        position: {
          lat: center.lat,
          lng: center.lng,
        },
        map: mapRef.current,
      });

      // 지도 클릭 이벤트 리스너 추가
      mapRef.current.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        locationCoords({ lat: clickedLat, lng: clickedLng });
      });
    }
  }, [center.lat, center.lng, locationCoords]); // lat, lng, locationCoords가 변경될 때마다 effect 실행

  // lat와 lng가 변경될 때마다 지도 중심과 마커 위치 업데이트
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newCenter = calculateCenterAndMarker(lat, lng); // 새로운 중심 좌표 계산
      setCenter(newCenter); // 중심 좌표 상태 업데이트
      mapRef.current.setCenter(newCenter); // 지도 중심 업데이트
      markerRef.current.setPosition(newCenter); // 마커 위치 업데이트
    }
  }, [lat, lng]);

  // 지도 DOM 요소 렌더링
  return <div id="map" className="map"></div>;
}
