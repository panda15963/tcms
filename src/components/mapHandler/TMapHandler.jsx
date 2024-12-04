import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TMap from '../../pages/mapPages/TMap';
import Error from '../alerts/Error';

/**
 * TMapHandler 컴포넌트
 * - TMap 컴포넌트를 조건에 따라 렌더링
 * - 선택된 좌표 또는 기본 위치 데이터를 지도에 표시
 * - 국가 코드에서 'KOR' 이외의 값을 허용하지 않음
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 (위도 및 경도)
 * @param {object} props.tmapLocation - TMap 기본 위치 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 * @param {Array} props.country - 국가 코드 배열
 * @param {Array} props.checkedNode - 선택된 노드 데이터
 * @param {object} props.clickedNode - 클릭된 노드 데이터
 * @param {function} props.routeColors - 경로 색상 처리 함수
 */
export default function TMapHandler({
  selectedCoords,
  tmapLocation,
  routeFullCoords,
  spaceFullCoords,
  country,
  checkedNode,
  clickedNode,
  routeColors = () => {},
}) {
  const [error, setError] = useState(false); // 오류 상태
  const [errorValue, setErrorValue] = useState(''); // 오류 메시지 상태
  const { t } = useTranslation();

  /**
   * 국가 코드 배열에서 'KOR' 이외의 값이 있는지 확인
   * @param {Array} countries - 국가 코드 배열
   * @returns {boolean} - 'KOR' 이외의 값이 포함되어 있으면 true
   */
  const containsNonKOR = (countries) => {
    return countries.some((item) => item !== 'KOR');
  };

  /**
   * 국가 코드 배열에 따라 오류 상태 업데이트
   */
  useEffect(() => {
    if (Array.isArray(country) && containsNonKOR(country)) {
      setError(true);
      setErrorValue(t('TMap.KoreaRegionOnlyError')); // 한국 지역만 허용하는 오류 메시지
    } else {
      setError(false);
      setErrorValue('');
    }
  }, [country, t]);

  return (
    <>
      {error && <Error errorMessage={errorValue} />} {/* 오류 메시지 표시 */}
      {selectedCoords && tmapLocation ? (
        <TMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tmapLocation}
          routeFullCoords={routeFullCoords}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={spaceFullCoords}
        />
      ) : selectedCoords && tmapLocation ? (
        <TMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={tmapLocation}
          routeColors={routeColors}
          spaceFullCoords={spaceFullCoords}
        />
      ) : !selectedCoords && tmapLocation ? (
        <TMap
          locationCoords={tmapLocation}
          routeFullCoords={routeFullCoords}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={spaceFullCoords}
        />
      ) : tmapLocation ? (
        <TMap locationCoords={tmapLocation} />
      ) : (
        <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>
      )}
    </>
  );
}