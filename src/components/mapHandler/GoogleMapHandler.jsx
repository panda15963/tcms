import GoogleMaps from '../../pages/mapPages/GoogleMap';
import { ToastContainer, toast, Bounce } from 'react-toastify'; // 토스트 알림 컴포넌트

/**
 * GoogleMapHandler 컴포넌트
 * - GoogleMap 컴포넌트를 조건에 따라 렌더링
 * - 필터링된 경로 및 공간 데이터를 GoogleMap에 전달
 * - 오류 상태를 관리하고 처리
 *
 * @param {object} props - 컴포넌트에 전달되는 속성
 * @param {object} props.selectedCoords - 선택된 좌표 (위도 및 경도)
 * @param {object} props.googleLocation - Google 지도 위치 데이터
 * @param {Array} props.routeFullCoords - 전체 경로 데이터
 * @param {Array} props.checkedNode - 선택된 노드 데이터
 * @param {object} props.clickedNode - 클릭된 노드 데이터
 * @param {function} props.routeColors - 경로 색상 처리 함수
 * @param {Array} props.spaceFullCoords - 전체 공간 데이터
 * @param {function} props.onClearMap - 지도 초기화 함수
 * @param {string} props.selectedAPI - 선택된 API 키
 * @param {string} props.typeMap - 지도 유형
 */
export default function GoogleMapHandler({
  selectedCoords,
  googleLocation,
  routeFullCoords = [],
  checkedNode = [],
  clickedNode,
  routeColors = () => {},
  spaceFullCoords = [],
  onClearMap,
  selectedAPI,
  typeMap,
}) {
  /**
   * 오류 처리를 위한 함수
   * @param {string} message - 오류 메시지
   */
  const handleError = (message) => {
    toast.error(message);
  };

  // checkedNode에서 file_id를 추출
  const checkedFileIds = checkedNode.map((node) => node.file_id);

  const filteredRoutes = routeFullCoords
    ? routeFullCoords.filter((route) => checkedFileIds.includes(route.file_id))
    : [];

  // 선택된 공간을 필터링
  const filteredSpaces = spaceFullCoords
    ? spaceFullCoords.filter((space) => checkedFileIds.includes(space.file_id))
    : [];

  // GoogleMap 컴포넌트 렌더링
  return (
    <>
      <GoogleMaps
        lat={selectedCoords?.lat} // 선택된 위도
        lng={selectedCoords?.lng} // 선택된 경도
        locationCoords={googleLocation} // Google 지도 위치 데이터
        routeFullCoords={filteredRoutes} // 필터링된 경로 데이터
        clickedNode={clickedNode} // 클릭된 노드 데이터
        error={handleError} // 오류 처리 함수
        routeColors={routeColors} // 경로 색상 처리 함수
        spaceFullCoords={filteredSpaces} // 필터링된 공간 데이터
        onClearMap={onClearMap}
        checkedNode={checkedNode} // 선택된 노드 데이터
        selectedAPI={selectedAPI}
        typeMap={typeMap}
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
