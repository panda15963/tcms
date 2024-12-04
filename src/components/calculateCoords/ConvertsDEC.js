export function DECToDEC(coords) {
  /**
   * DEC 좌표 입력 시 그대로 DEC 좌표를 표출하는 함수
   * 
   * 주어진 좌표가 유효한지 확인하고, 소수점 6자리로 고정된 DEC 좌표를 반환합니다.
   * 유효하지 않은 좌표가 입력되면 빈 문자열로 반환합니다.
   * 
   * @param {Object} coords - DEC 좌표 객체 (lat, lng)
   * @returns {Object} - 포맷된 DEC 좌표 객체 (lat, lng)
   */
  if (
    !coords ||
    typeof coords.lat !== 'number' ||
    typeof coords.lng !== 'number'
  ) {
    return { lat: '', lng: '' }; // 좌표가 유효하지 않을 경우 빈 값 반환
  }

  // 소수점 6자리로 고정된 DEC 좌표 반환
  const DECLat = parseFloat(coords.lat).toFixed(6);
  const DECLng = parseFloat(coords.lng).toFixed(6);

  return { lat: DECLat, lng: DECLng };
}

export function DECToDEG(coords) {
  /**
   * DEC 좌표를 DEG 좌표로 변환하는 함수
   * 
   * 주어진 DEC 좌표를 도, 분, 초 형식의 DEG 좌표로 변환하여 반환합니다.
   * 
   * @param {Object} coords - DEC 좌표 객체 (lat, lng)
   * @returns {Object} - DEG 좌표 객체 (lat, lng)
   */
  const convertToDMS = (coord) => {
    /**
     * 소수점 DEC 좌표를 도, 분, 초 형식으로 변환하는 함수
     * 
     * 주어진 DEC 좌표 값을 도(degrees), 분(minutes), 초(seconds)로 변환합니다.
     * 
     * @param {number} coord - 소수점 DEC 좌표 값
     * @returns {string} - DEG 형식의 좌표 문자열 (degrees minutes seconds)
     */
    const degrees = Math.floor(coord); // 도
    const minutes = Math.floor((coord - degrees) * 60); // 분
    const seconds = (((coord - degrees) * 60 - minutes) * 60).toFixed(1); // 초

    return `${degrees} ${minutes} ${seconds}`;
  };

  // 위도와 경도를 각각 DEG 형식으로 변환
  const DEGLat = convertToDMS(coords.lat);
  const DEGLng = convertToDMS(coords.lng);

  return {
    lat: DEGLat,
    lng: DEGLng,
  };
}

export function DECToMMS(coords) {
  /**
   * DEC 좌표를 MMS 좌표로 변환하는 함수
   * 
   * 주어진 DEC 좌표를 MMS 좌표 (밀리초 단위)로 변환하여 반환합니다.
   * 
   * @param {Object} coords - DEC 좌표 객체 (lat, lng)
   * @returns {Object} - MMS 좌표 객체 (lat, lng)
   */
  const MMSLat = parseInt(coords.lat * 360000); // 위도를 MMS로 변환
  const MMSLng = parseInt(coords.lng * 360000); // 경도를 MMS로 변환

  return { lat: MMSLat, lng: MMSLng }; // 변환된 MMS 좌표 반환
}