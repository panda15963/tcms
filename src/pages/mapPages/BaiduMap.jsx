import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css';

/**
 * 지도 중심 좌표와 마커 좌표를 계산하는 함수
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
  } else {
    return { lat: defaultLat, lng: defaultLng };
  }
}

/**
 * BaiduMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function BaiduMap({ lat, lng, locationCoords = () => {} }) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스와 마커를 저장하기 위한 ref

  // lat와 lng가 변경될 때마다 중심 좌표 업데이트
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  // Baidu 지도 로드 및 초기화
  useEffect(() => {
    /**
     * Baidu 지도 API를 로드하는 함수
     */
    const loadBaiduMap = () => {
      if (!window.BMapGL) {
        // Baidu 지도 API가 로드되지 않은 경우, 스크립트 동적으로 추가
        const script = document.createElement('script');
        script.src =
          'https://api.map.baidu.com/api?v=3.0&type=webgl&ak=' +
          process.env.REACT_APP_BAIDU_MAP_API; // Baidu API 키를 사용하여 스크립트 로드
        script.onload = initializeMap; // 스크립트 로드 완료 시 지도 초기화
        document.head.appendChild(script);
      } else {
        initializeMap(); // 이미 API가 로드된 경우 지도 초기화
      }
    };

    /**
     * 지도를 초기화하는 함수
     */
    const initializeMap = () => {
      const mapInstance = new window.BMapGL.Map('allmap'); // 새로운 Baidu 지도 인스턴스 생성
      const point = new window.BMapGL.Point(center.lng, center.lat); // 초기 좌표 설정
      mapInstance.centerAndZoom(point, Number(process.env.REACT_APP_ZOOM)); // 지도 중심 및 줌 설정
      mapInstance.enableScrollWheelZoom(true); // 스크롤 휠 줌 활성화
      const marker = new window.BMapGL.Marker(point); // 마커 추가
      mapInstance.addOverlay(marker); // 마커를 지도에 추가

      // 지도 클릭 이벤트 리스너 추가
      mapInstance.addEventListener('click', (event) => {
        const clickedPoint = event.latlng; // 클릭한 좌표
        const clickedLat = clickedPoint.lat;
        const clickedLng = clickedPoint.lng;
        locationCoords({ lat: clickedLat, lng: clickedLng }); // 부모 컴포넌트에 클릭한 좌표 전달
      });

      // 지도 인스턴스와 마커를 ref에 저장
      mapRef.current = { mapInstance, marker };
    };

    loadBaiduMap(); // Baidu 지도 로드
  }, []);

  // 중심 좌표가 변경되었을 때 지도와 마커 업데이트
  useEffect(() => {
    if (mapRef.current) {
      const { mapInstance, marker } = mapRef.current;
      const point = new window.BMapGL.Point(center.lng, center.lat); // 새로운 중심 좌표 설정
      mapInstance.centerAndZoom(point, Number(process.env.REACT_APP_ZOOM)); // 지도 중심 재설정
      marker.setPosition(point); // 마커 위치 재설정
    }
  }, [center]);

  return (
    <div>
      {/* 지도 표시 영역 */}
      <div id="allmap" className="map"></div>
    </div>
  );
}
