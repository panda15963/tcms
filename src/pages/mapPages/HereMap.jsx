import H from '@here/maps-api-for-javascript';
import { useEffect, useRef } from 'react';
import '../../style/MapStyle.css';

/**
 * HereMap 컴포넌트
 */
export default function HereMap() {
  const mapRef = useRef(null); // 지도 DOM 요소를 참조하기 위한 ref
  const map = useRef(null); // 지도 인스턴스 상태 관리
  const platform = useRef(null); // HERE Maps 플랫폼 인스턴스 상태 관리
  const API_KEY = process.env.REACT_APP_HERE_MAP_API; // 환경 변수에서 HERE Maps API 키 가져오기

  // HERE Maps API 로드 및 지도 초기화
  useEffect(() => {
    if (!map.current) {
      // 플랫폼 인스턴스 생성
      platform.current = new H.service.Platform({
        apikey: API_KEY, // HERE Maps API 키 설정
      });

      // 기본 레이어 생성
      const defaultLayers = platform.current.createDefaultLayers({
        pois: true, // POI(Point of Interest) 레이어 활성화
      });

      // 지도 인스턴스 생성
      const newMap = new H.Map(
        mapRef.current, // 렌더링할 DOM 요소
        defaultLayers.vector.normal.map, // 기본 벡터 지도 레이어 사용
        {
          zoom: Number(process.env.REACT_APP_ZOOM), // 환경 변수에서 줌 레벨 가져오기
          center: {
            lat: Number(process.env.REACT_APP_LATITUDE), // 환경 변수에서 기본 위도 값 가져오기
            lng: Number(process.env.REACT_APP_LONGITUDE), // 환경 변수에서 기본 경도 값 가져오기
          },
        },
      );

      // 지도 상에서의 마우스 이벤트 활성화 (줌, 패닝 등)
      new H.mapevents.Behavior(new H.mapevents.MapEvents(newMap));

      // 지도 인스턴스 저장
      map.current = newMap;
    }
  }, [API_KEY]); // API_KEY가 변경될 때마다 effect 실행

  // 지도 DOM 요소를 렌더링
  return <div className='map' ref={mapRef} />;
}
