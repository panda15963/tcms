import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoutoMap from '../../pages/mapPages/RoutoMap';
import { ToastContainer, toast, Bounce } from 'react-toastify'; // 토스트 알림 컴포넌트

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
 * @param {function} props.onClearMap - 지도 초기화 함수
 * @param {string} props.selectedAPI - 선택된 API 키
 * @param {string} props.typeMap - 지도 유형
 */
export default function RoutoMapHandler({
  selectedCoords, // 선택된 좌표 (위도 및 경도)
  routoLocation, // RoutoMap 위치 데이터
  routeFullCoords = [], // 전체 경로 데이터 (기본값: 빈 배열)
  country, // 국가 코드 배열
  checkedNode = [], // 선택된 노드 데이터 (기본값: 빈 배열)
  clickedNode, // 클릭된 노드 데이터
  routeColors = () => {}, // 경로 색상 처리 함수 (기본값: 빈 함수)
  spaceFullCoords, // 전체 공간 데이터
  onClearMap, // 지도를 초기화하는 함수
  selectedAPI,
  typeMap,
}) {
  const { t } = useTranslation();

  // 국가 코드 배열에 'KOR' 외의 값이 포함되어 있는지 확인
  useEffect(() => {
    if (country?.some((item) => item !== 'KOR')) {
      toast.error(t('RoutoMap.KoreaRegionOnlyError')); // 한국 지역만 허용하는 오류 메시지
    }
  }, [country, t]);

  // checkedNode에서 file_id를 추출하고 필터링
  const checkedFileIds = checkedNode.map((node) => node.file_id);
  const filteredRoutes = (routeFullCoords || []).filter((route) =>
    checkedFileIds.includes(route.file_id)
  );

  const filteredSpaces = (spaceFullCoords || []).filter((space) =>
    checkedFileIds.includes(space.file_id)
  );

  // RoutoMap 컴포넌트 렌더링
  return (
    <>
      <RoutoMap
        lat={selectedCoords?.lat} // 선택된 위도
        lng={selectedCoords?.lng} // 선택된 경도
        locationCoords={routoLocation} // 위치 데이터
        checkedNodes={checkedNode} // 선택된 노드 데이터 전달
        routeFullCoords={filteredRoutes} // 필터링된 경로 데이터 전달
        clickedNode={clickedNode} // 클릭된 노드 데이터 전달
        routeColors={routeColors} // 경로 색상 처리 함수 전달
        spaceFullCoords={filteredSpaces} // 필터링된 공간 데이터 전달
        onClearMap={onClearMap} // 지도 초기화 함수 전달
        selectedAPI={selectedAPI} // 선택된 API 키 전달
        typeMap={typeMap} // 지도 유형 전달
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
