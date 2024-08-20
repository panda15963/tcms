export function MMSToDEC(coords) {
  /**
   * MMS 좌표를 DEC 좌표로 변환하는 함수
   * 
   * MMS 좌표는 보통 밀리초 단위로 표현되며, 이 값을 360000으로 나누어 DEC 좌표로 변환합니다.
   * 변환된 DEC 좌표는 소수점 6자리로 고정됩니다.
   * 
   * @param {Object} coords - MMS 좌표 객체 (lat, lng)
   * @returns {Object} - DEC 좌표 객체 (lat, lng)
   */
  const DECLat = parseFloat(coords.lat / 360000).toFixed(6); // MMS 위도를 DEC 위도로 변환
  const DECLng = parseFloat(coords.lng / 360000).toFixed(6); // MMS 경도를 DEC 경도로 변환

  return { lat: DECLat, lng: DECLng }; // 변환된 DEC 좌표 반환
}
