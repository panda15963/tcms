import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleGeom } from 'ol/geom';

/**
 * OpenLayers 기반 MapComponent
 * - 특정 좌표와 반경을 중심으로 지도 및 원형 표시
 * - 클릭 이벤트를 통해 클릭한 좌표를 부모 컴포넌트로 전달
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {number} props.latitude - 지도 중심의 위도
 * @param {number} props.longitude - 지도 중심의 경도
 * @param {number} props.radius - 중심 원의 반경 (미터 단위)
 * @param {function} props.onMapClick - 지도 클릭 시 호출되는 콜백 함수
 */
const MapComponent = ({ latitude, longitude, radius, onMapClick }) => {
  const mapRef = useRef(); // 지도를 렌더링할 DOM 요소 참조
  const vectorSourceRef = useRef(new VectorSource()); // 벡터 소스를 관리하는 참조
  const mapInstance = useRef(null); // OpenLayers Map 인스턴스

  useEffect(() => {
    // 지도 중심 좌표 변환 (경위도 → Web Mercator)
    const center = fromLonLat([longitude, latitude]);

    // 중심 원 Feature 생성
    const circleFeature = new Feature({
      geometry: new CircleGeom(center, radius),
    });

    // 중심 원 스타일 설정
    circleFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'blue', // 원의 테두리 색상
          width: 2, // 테두리 두께
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)', // 원 내부 색상 및 투명도
        }),
      })
    );

    // 기존 피처 제거 후 새 피처 추가
    vectorSourceRef.current.clear();
    vectorSourceRef.current.addFeature(circleFeature);

    // Map 인스턴스 생성 또는 업데이트
    if (!mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current, // 렌더링할 DOM 요소
        layers: [
          // 타일 레이어: OpenStreetMap
          new TileLayer({
            source: new OSM(),
          }),
          // 벡터 레이어: 중심 원 표시
          new VectorLayer({
            source: vectorSourceRef.current,
          }),
        ],
        view: new View({
          center: center, // 지도 초기 중심
          zoom: 11, // 초기 줌 레벨
        }),
      });

      // 지도 클릭 이벤트 처리
      mapInstance.current.on('click', (event) => {
        const clickedCoordinate = toLonLat(event.coordinate); // 클릭 좌표 변환 (Web Mercator → 경위도)
        const [lon, lat] = clickedCoordinate;
        onMapClick && onMapClick({ latitude: lat, longitude: lon }); // 부모 컴포넌트에 클릭 좌표 전달
      });
    } else {
      // 지도 중심 업데이트
      mapInstance.current.getView().setCenter(center);
    }
  }, [latitude, longitude, radius, onMapClick]); // 종속성 배열: 속성 변경 시 effect 재실행

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg overflow-hidden border border-gray-300"
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
export default MapComponent;