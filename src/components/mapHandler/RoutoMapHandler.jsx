import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoutoMap from '../../pages/mapPages/RoutoMap';
import Error from '../alerts/Error';

export default function RoutoMapHandler({
  selectedCoords,
  routoLocation,
  origins,
  destinations,
  country,
  checkedNode,
  clickedNode,
}) {
  /**
   * ROUTO 지도 표출 컴포넌트
   *
   * selectedCoords가 null이 아닌 경우, 해당 좌표(lat, lng)를 RoutoMap 컴포넌트에 전달하여 지도에 해당 좌표를 표시하고,
   * 그렇지 않으면 routoLocation 좌표만 RoutoMap 컴포넌트에 전달하여 기본 위치를 지도에 표시합니다.
   */
  const [error, setError] = useState(false);
  const [errorValue, setErrorValue] = useState('');
  const { t } = useTranslation();

  // country 배열에서 "KOR" 이외의 값이 있는지 확인하는 함수
  const containsNonKOR = (countries) => {
    return countries.some((item) => item !== 'KOR');
  };

  // country 배열에 "KOR" 이외의 값이 있을 때 에러 알림 설정
  useEffect(() => {
    if (Array.isArray(country) && containsNonKOR(country)) {
      setError(true);
      setErrorValue(t('RoutoMap.KoreaRegionOnlyError'));
    } else {
      setError(false);
      setErrorValue('');
    }
  }, [country]);

  return (
    <>
      {error && <Error errorMessage={errorValue} />}
      {selectedCoords && routoLocation && origins && destinations ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
          origins={origins}
          destinations={destinations}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
        />
      ) : selectedCoords && routoLocation ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
        />
      ) : !selectedCoords && routoLocation && origins && destinations ? (
        <RoutoMap
          locationCoords={routoLocation}
          origins={origins}
          destinations={destinations}
          checkedNodes={checkedNode}
          clickedNode={clickedNode}
        />
      ) : routoLocation ? (
        <RoutoMap locationCoords={routoLocation} />
      ) : (
        <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>
      )}
    </>
  );
}
