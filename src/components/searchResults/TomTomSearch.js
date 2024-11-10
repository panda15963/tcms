export const TomTomSearch = async (value) => {
  /**
   * Google Places API를 사용하여 TomTom에서 장소 검색을 수행하는 함수
   * (현재 Google Places API를 사용하고 있으므로 TomTom과는 직접적인 관련이 없습니다)
   *
   * @param {string} value - 검색어로 사용할 텍스트
   * @returns {Array} - 검색 결과로부터 장소 이름, 위도(latitude), 경도(longitude)를 포함한 객체 배열
   */

  // Google Maps API의 Place 라이브러리 임포트
  const { Place } = await google.maps.importLibrary('places');

  // 검색 요청 객체 설정
  const request = {
    textQuery: value, // 검색할 텍스트 쿼리
    fields: ['displayName', 'location'], // 응답에서 가져올 필드: 장소 이름과 위치 정보
  };

  // 텍스트 검색 수행
  const { places } = await Place.searchByText(request);

  // 검색 결과가 있을 경우 장소 정보 반환
  if (places.length) {
    return places
      .map((place) => ({
        name: place.displayName, // 장소 이름
        latitude: place.Eg.location.lat, // 위도
        longitude: place.Eg.location.lng, // 경도
      }))
      .filter((place) => place.latitude && place.longitude); // 유효한 위도 및 경도가 있는 장소만 필터링
  } else {
    return []; // 검색 결과가 없을 경우 빈 배열 반환
  }
};

// export const TomTomSearch = async (value) => {
//   const fetch = require('node-fetch');
//   const apiKey = process.env.REACT_APP_TOMTOM_MAP_API;

//   // TomTom Fuzzy Search API 요청 URL
//   const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(value)}.json?key=${apiKey}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     if (data.results && data.results.length > 0) {
//       console.log('장소 검색 결과:', data.results);
//     } else {
//       console.log('검색 결과가 없습니다.');
//     }
//   } catch (error) {
//     console.error('API 호출 오류:', error);
//   }
// };
