import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TMap from '../../pages/mapPages/TMap';
import { ToastContainer, toast, Bounce } from 'react-toastify'; // 토스트 알림 컴포넌트

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
 * @param {string} props.selectedAPIKey - 선택된 API 키
 * @param {string} props.typeMap - 지도 유형
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
  selectedAPI,
  typeMap,
}) {
  const { t } = useTranslation(); // 다국어 지원을 위한 useTranslation 훅

  // 국가 코드 검증
  useEffect(() => {
    if (Array.isArray(country) && country.some((item) => item !== 'KOR')) {
      toast.error(t('TMap.KoreaRegionOnlyError')); // 오류 메시지 설정
    }
  }, [country, t]);

  // TMap 컴포넌트를 렌더링
  return (
    <>
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
      selectedAPI={selectedAPI} // 선택된 API 키
      typeMap={typeMap} // 지도 유형
    />
    <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
    </>
  );
}
