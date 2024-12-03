import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoutoMap from '../../pages/mapPages/RoutoMap';
import Error from '../alerts/Error';

/**
 * RoutoMapHandler 컴포넌트
 * - 특정 좌표 및 경로 데이터를 RoutoMap에 전달하여 지도 렌더링
 * - 한국(KOR) 외의 국가 데이터가 포함될 경우 오류 표시
 * 
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 (위도 및 경도)
 * @param {object} props.routoLocation - RoutoMap 위치 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.country - 국가 코드 배열
 * @param {Array} props.checkedNode - 선택된 노드 데이터
 * @param {object} props.clickedNode - 클릭된 노드 데이터
 * @param {function} props.routeColors - 경로 색상 처리 함수
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 */
export default function RoutoMapHandler({
  selectedCoords,
  routoLocation,
  routeFullCoords = [], // 기본값: 빈 배열
  country,
  checkedNode = [], // 기본값: 빈 배열
  clickedNode,
  routeColors = () => {}, // 기본값: 빈 함수
  spaceFullCoords,
}) {
  const [error, setError] = useState(false); // 오류 상태
  const [errorValue, setErrorValue] = useState(''); // 오류 메시지
  const { t } = useTranslation();

  /**
   * 국가 코드 배열에 'KOR' 외의 값이 포함되었는지 확인
   * @param {Array} countries - 국가 코드 배열
   * @returns {boolean} - 'KOR' 외의 값이 포함되어 있으면 true
   */
  const containsNonKOR = (countries) => {
    return countries?.some((item) => item !== 'KOR'); // null 오류 방지
  };

  /**
   * 국가 코드에 따라 오류 상태 업데이트
   */
  useEffect(() => {
    if (Array.isArray(country) && containsNonKOR(country)) {
      setError(true);
      setErrorValue(t('RoutoMap.KoreaRegionOnlyError')); // 한국 지역만 허용하는 오류 메시지
    } else {
      setError(false);
      setErrorValue('');
    }
  }, [country, t]);

  // checkedNode에서 file_id를 안전하게 추출하고 필터링
  const checkedFileIds = checkedNode?.map((node) => node.file_id);
  const filteredRoutes =
    routeFullCoords?.filter((route) =>
      checkedFileIds?.includes(route.file_id)
    ) || []; // 기본값: 빈 배열
  const filteredSpaces =
    spaceFullCoords?.filter((space) =>
      checkedFileIds?.includes(space.file_id)
    ) || []; // 기본값: 빈 배열

  return (
    <>
      {error && <Error errorMessage={errorValue} />} {/* 오류 메시지 표시 */}
      {selectedCoords && routoLocation ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
          checkedNodes={checkedNode} // 선택된 노드 전달
          routeFullCoords={filteredRoutes} // 필터링된 경로 전달
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
        />
      ) : selectedCoords && routoLocation ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
          routeColors={routeColors}
          spaceFullCoords={filteredSpaces}
        />
      ) : !selectedCoords && routoLocation ? (
        <RoutoMap
          locationCoords={routoLocation}
          checkedNodes={checkedNode} // 선택된 노드 전달
          routeFullCoords={filteredRoutes} // 필터링된 경로 전달
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
        />
      ) : routoLocation ? (
        <RoutoMap locationCoords={routoLocation} />
      ) : (
        <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>
      )}
    </>
  );
}