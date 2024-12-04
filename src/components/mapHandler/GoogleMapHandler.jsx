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
  routeFullCoords,
  checkedNode,
  clickedNode,
  routeColors = () => {},
  spaceFullCoords,
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
  
  // checkedNode에서 file_id를 안전하게 추출
  const checkedFileIds = (checkedNode ?? []).map((node) => node.file_id);

  // 선택된 경로 필터링
  const filteredRoutes = (routeFullCoords ?? []).filter((route) =>
    checkedFileIds.includes(route.file_id)
  );

  console.log('routeFullCoords:', routeFullCoords);
  console.log('checkedNode:', checkedNode);

  // 선택된 공간 필터링
  const filteredSpaces = (spaceFullCoords ?? []).filter((space) =>
    checkedFileIds.includes(space.file_id)
  );

  return (
    <>
      {isError && <Error errorMessage={errorText} />} {/* 오류 메시지 출력 */}
      {selectedCoords && googleLocation ? (
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
          routeFullCoords={filteredRoutes} // 필터링된 경로 전달
          clickedNode={clickedNode}
          error={handleError} // 오류 처리 함수 전달
          routeColors={routeColors} // 경로 색상 처리 함수 전달
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
        />
      ) : selectedCoords && googleLocation ? (
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
          error={handleError} // 오류 처리 함수 전달
          routeColors={routeColors} // 경로 색상 처리 함수 전달
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
        />
      ) : !selectedCoords && googleLocation ? (
        <GoogleMap
          locationCoords={googleLocation}
          routeFullCoords={filteredRoutes} // 필터링된 경로 전달
          clickedNode={clickedNode}
          error={handleError} // 오류 처리 함수 전달
          routeColors={routeColors} // 경로 색상 처리 함수 전달
          spaceFullCoords={filteredSpaces} // 필터링된 공간 전달
        />
      ) : googleLocation ? (
        <GoogleMap
          locationCoords={googleLocation}
          error={handleError} // 오류 처리 함수 전달
        />
      ) : (
        <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />
      )}
    </>
  );
}