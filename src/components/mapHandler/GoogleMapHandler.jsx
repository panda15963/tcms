import { useState } from 'react';
import GoogleMap from '../../pages/mapPages/GoogleMap';
import Error from '../alerts/Error';

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
 */
export default function GoogleMapHandler({
  selectedCoords,
  googleLocation,
  routeFullCoords = [],
  checkedNode = [],
  clickedNode,
  routeColors = () => {},
  spaceFullCoords = [],
}) {
  const [isError, setIsError] = useState(false); // 오류 상태
  const [errorText, setErrorText] = useState(null); // 오류 메시지 상태

  /**
   * 오류 처리를 위한 함수
   * @param {string} message - 오류 메시지
   */
  const handleError = (message) => {
    setIsError(true);
    setErrorText(message);
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

  // 오류가 있을 경우 오류 메시지 컴포넌트를 반환
  if (isError) return <Error errorMessage={errorText} />;

  // googleLocation이 없을 경우 오류 메시지 컴포넌트를 반환
  if (!googleLocation)
    return <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />;

  // GoogleMap 컴포넌트 렌더링
  return (
    <GoogleMap
      lat={selectedCoords?.lat} // 선택된 위도
      lng={selectedCoords?.lng} // 선택된 경도
      locationCoords={googleLocation} // Google 지도 위치 데이터
      routeFullCoords={filteredRoutes} // 필터링된 경로 데이터
      clickedNode={clickedNode} // 클릭된 노드 데이터
      error={handleError} // 오류 처리 함수
      routeColors={routeColors} // 경로 색상 처리 함수
      spaceFullCoords={filteredSpaces} // 필터링된 공간 데이터
    />
  );
}
