/**
 * Google Places API를 사용하여 장소 검색을 수행하는 함수
 * 
 * @param {string} value - 검색어로 사용할 텍스트
 * @returns {Array} - 검색 결과로부터 장소 이름, 위도(latitude), 경도(longitude)를 포함한 객체 배열
 */
const loadGoogleMapsApi = () =>
  new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_API}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });

/**
 * Google Places API를 사용하여 텍스트 검색을 수행하는 함수
 * 
 * @param {string} value - 검색어로 사용할 텍스트
 * @returns {Promise<Array>} - 검색 결과로부터 장소 이름, 위도(latitude), 경도(longitude)를 포함한 객체 배열
 */
export const BaiduSearch = async (value) => {
  try {
    // Google Maps API가 로드되었는지 확인
    await loadGoogleMapsApi();

    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API 스크립트를 로드하지 못했습니다.');
    }

    // PlacesService 인스턴스 생성
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    // 검색 요청 구성
    const request = {
      query: value,
      fields: ['name', 'geometry.location'],
    };

    // 검색 수행
    return new Promise((resolve, reject) => {
      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.map((place) => ({
            name: place.name,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          }));
          resolve(places);
        } else {
          reject(`장소 검색에 실패했습니다: ${status}`);
        }
      });
    });
  } catch (error) {
    console.error('BaiduSearch에서 오류 발생:', error);
    return [];
  }
};
