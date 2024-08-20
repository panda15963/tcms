const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json', // 응답 데이터 형식으로 JSON을 기대
  },
};

/**
 * TMap API를 사용하여 장소 검색을 수행하는 함수
 * 
 * @param {string} value - 검색어로 사용할 텍스트
 * @returns {Array} - 검색 결과로부터 장소 이름, 위도(latitude), 경도(longitude)를 포함한 객체 배열
 */
export const TMapSearch = async (value) => {
  try {
    // TMap API에 요청을 보냄, 검색 키워드를 URL에 포함
    const response = await fetch(
      `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${encodeURIComponent(value)}&resCoordType=WGS84GEO&searchType=all&count=10&page=1&appKey=l7xx8a1100ddc88c4681acdf968333275cc4`,
      options,
    );

    // 응답이 성공적이지 않을 경우 에러 발생
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 응답 데이터를 JSON 형식으로 파싱
    const data = await response.json();

    // 검색 결과가 배열 형태인지 확인하고 장소 정보를 매핑
    if (Array.isArray(data.searchPoiInfo.pois.poi)) {
      return data.searchPoiInfo.pois.poi.map((place) => ({
        name: place.name, // 장소 이름
        latitude: place.frontLat, // 위도
        longitude: place.frontLon, // 경도
      }));
    } else {
      console.log('No places found or the data format is incorrect'); // 데이터가 없거나 형식이 올바르지 않음
      return [];
    }
  } catch (error) {
    console.error('Error:', error); // 에러 발생 시 콘솔에 로그 출력
  }
};
