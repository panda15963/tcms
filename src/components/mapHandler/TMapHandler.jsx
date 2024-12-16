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
 * @param {function} props.onClearMap - 지도 초기화 함수
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
  onClearMap,
}) {
  const [error, setError] = useState(false); // 오류 상태 관리
  const [errorValue, setErrorValue] = useState(''); // 오류 메시지 상태 관리
  const { t } = useTranslation(); // 다국어 지원을 위한 useTranslation 훅

  // 국가 코드 검증
  useEffect(() => {
    if (Array.isArray(country) && country.some((item) => item !== 'KOR')) {
      setError(true); // 오류 상태 설정
      setErrorValue(t('TMap.KoreaRegionOnlyError')); // 오류 메시지 설정
    } else {
      setError(false); // 오류 상태 초기화
      setErrorValue(''); // 오류 메시지 초기화
    }
  }, [country, t]);

  // 오류가 있을 경우 오류 메시지 컴포넌트를 반환
  if (error) return <Error errorMessage={errorValue} />;

  // 위치 정보가 없을 경우 메시지 반환
  if (!tmapLocation) return <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>;

  // TMap 컴포넌트를 렌더링
  return (
    <TMap
      lat={selectedCoords?.lat} // 선택된 위도
      lng={selectedCoords?.lng} // 선택된 경도
      locationCoords={tmapLocation} // TMap 위치 데이터
      routeFullCoords={routeFullCoords} // 전체 경로 데이터
      spaceFullCoords={spaceFullCoords} // 전체 공간 데이터
      checkedNodes={checkedNode} // 선택된 노드 데이터
      clickedNode={clickedNode} // 클릭된 노드 데이터
      routeColors={routeColors} // 경로 색상 처리 함수
      onClearMap={onClearMap} // 지도 초기화 함수
    />
  );
}
