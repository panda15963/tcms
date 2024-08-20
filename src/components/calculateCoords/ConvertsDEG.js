export function DEGToDEC(coords) {
  /**
   * DEG 좌표를 DEC 좌표로 변환하는 함수
   * 
   * 주어진 DEG 좌표 (도, 분, 초) 형식의 값을 DEC 좌표로 변환하여 반환합니다.
   * DEG 형식은 보통 도(degrees), 분(minutes), 초(seconds)로 구성됩니다.
   * 
   * @param {Object} coords - DEG 좌표 객체 (lat, lng)
   * @returns {Object} - DEC 좌표 객체 (lat, lng)
   */
  const { lat, lng } = coords;

  function formatToDEG(decimal) {
    /**
     * 소수점 좌표를 DEG 좌표 형식으로 변환하는 함수
     * 
     * 주어진 소수점 좌표를 도, 분, 초 형식으로 변환하여 문자열로 반환합니다.
     * 
     * @param {number} decimal - 소수점 좌표 값
     * @returns {string} - DEG 좌표 형식의 문자열 (degrees minutes seconds)
     */
    const degrees = Math.floor(decimal);
    const minutesFull = (decimal - degrees) * 60;
    const minutes = Math.floor(minutesFull);
    const seconds = (minutesFull - minutes) * 60;
    return `${degrees} ${minutes} ${seconds.toFixed(1)}`;
  }

  function calculateDECLat(lat) {
    /**
     * DEC 위도 계산 함수
     * 
     * 주어진 위도 값을 도, 분, 초 형식으로 변환한 후 이를 다시 소수점 DEC 좌표로 변환합니다.
     * 
     * @param {number} lat - DEG 형식의 위도 값
     * @returns {number} - 변환된 DEC 위도 값 (소수점 6자리로 고정)
     */
    const partsLat = formatToDEG(lat).split(' ');
    if (partsLat.length !== 3) throw new Error('Invalid latitude format');
    const degrees = parseFloat(partsLat[0]);
    const minutes = parseFloat(partsLat[1]) / 60;
    const seconds = parseFloat(partsLat[2]) / 3600;
    const latDEC = degrees + minutes + seconds;
    return latDEC.toFixed(6); // 소수점 6자리로 고정된 DEC 위도 반환
  }

  function calculateDECLng(lng) {
    /**
     * DEC 경도 계산 함수
     * 
     * 주어진 경도 값을 도, 분, 초 형식으로 변환한 후 이를 다시 소수점 DEC 좌표로 변환합니다.
     * 
     * @param {number} lng - DEG 형식의 경도 값
     * @returns {number} - 변환된 DEC 경도 값 (소수점 6자리로 고정)
     */
    const partsLng = formatToDEG(lng).split(' ');
    if (partsLng.length !== 3) throw new Error('Invalid longitude format');
    const degrees = parseFloat(partsLng[0]);
    const minutes = parseFloat(partsLng[1]) / 60;
    const seconds = parseFloat(partsLng[2]) / 3600;
    const lngDEC = degrees + minutes + seconds;
    return lngDEC.toFixed(6); // 소수점 6자리로 고정된 DEC 경도 반환
  }

  try {
    // 위도와 경도를 각각 DEC 형식으로 변환
    const latDEC = calculateDECLat(lat);
    const lngDEC = calculateDECLng(lng);
    return { lat: latDEC, lng: lngDEC }; // 변환된 DEC 좌표 반환
  } catch (error) {
    // 변환 중 오류가 발생하면 'Invalid'를 반환
    return { lat: 'Invalid', lng: 'Invalid' };
  }
}
