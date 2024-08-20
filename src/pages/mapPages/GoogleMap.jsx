import { useEffect, useRef, useState } from 'react';
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

  // lat와 lng가 정의되어 있으면 해당 값 사용, 그렇지 않으면 기본 좌표 사용
  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return { lat: defaultLat, lng: defaultLng };
}

/**
 * GoogleMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function GoogleMap({ lat, lng, locationCoords = () => {} }) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const [markers, setMarkers] = useState([initialCoords]); // 지도에 표시할 마커 상태 관리
  const [map, setMap] = useState(null); // Google Map 인스턴스 상태 관리
  const [geocoder, setGeocoder] = useState(null); // Geocoder 인스턴스 상태 관리
  const mapRef = useRef(null); // 지도 DOM 요소를 참조하기 위한 ref

  // lat와 lng가 변경될 때마다 중심 좌표와 마커 업데이트
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
    setMarkers([newCenter]);
  }, [lat, lng]);

  // Google Maps API 로드 및 지도 초기화
  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API is not available.');
      return;
    }

    // 지도 인스턴스 생성
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: Number(process.env.REACT_APP_ZOOM), // 환경 변수에서 줌 레벨 가져오기
      center: {
        lat: center.lat,
        lng: center.lng,
      },
      mapTypeControl: false, // 지도 유형 컨트롤 비활성화
    });

    // Geocoder 인스턴스 생성
    const geocoderInstance = new window.google.maps.Geocoder();

    // 지도 및 Geocoder 인스턴스 상태 업데이트
    setMap(mapInstance);
    setGeocoder(geocoderInstance);

    // 지도 클릭 이벤트 리스너 추가
    mapInstance.addListener('click', (e) => {
      geocode({ location: e.latLng }); // 클릭한 좌표로 지오코딩 수행
    });
  }, [center]);

  // 마커를 지도에 추가
  useEffect(() => {
    if (map) {
      markers.forEach((marker) => {
        new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng }, // 마커 위치 설정
          map: map, // 마커를 추가할 지도 인스턴스
        });
      });
    }
  }, [markers, map]);

  /**
   * Geocoding을 수행하는 함수
   * @param {Object} request - Geocoding 요청 객체 (위치 정보 포함)
   */
  const geocode = (request) => {
    if (!geocoder) {
      console.error('Geocoder is not initialized.');
      return;
    }

    // Geocoding 요청 수행
    geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;
        const location = results[0].geometry.location; // Geocoding 결과에서 위치 정보 추출
        map.setCenter(location); // 지도 중심을 Geocoding된 위치로 설정
        locationCoords({ lat: location.lat(), lng: location.lng() }); // 부모 컴포넌트에 위치 정보 전달
      })
      .catch((e) => {
        alert('Geocode was not successful for the following reason: ' + e); // Geocoding 실패 시 경고창 표시
      });
  };

  // 지도 DOM 요소를 렌더링
  return <div ref={mapRef} className="map" />;
}
