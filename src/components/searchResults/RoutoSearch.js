import axios from 'axios';

const API_URL = 'https://api.routo.com/v1/places/findplacefromtext'; // Routo API의 엔드포인트 URL
const API_KEY = process.env.REACT_APP_ROUTTO_MAP_API; // 환경 변수에 저장된 Routo API 키

// Axios 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 주어진 텍스트로 장소를 검색하는 함수
 * 
 * @param {string} query - 검색어로 사용할 텍스트
 * @returns {Object} - API 응답 데이터
 */
export const findPlaceFromText = async (query) => {
  try {
    // API 요청을 통해 장소 검색
    const response = await apiClient.get('', {
      params: { input: query, key: API_KEY }, // 요청 파라미터로 검색어와 API 키 전송
    });
    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error('Error fetching data', error); // 에러 발생 시 콘솔에 로그 출력
    throw error; // 에러 발생 시 에러를 다시 던짐
  }
};

/**
 * Routo API를 사용하여 장소 검색을 수행하는 함수
 * 
 * @param {string} value - 검색어로 사용할 텍스트
 * @returns {Array} - 검색 결과로부터 장소 이름, 위도(latitude), 경도(longitude)를 포함한 객체 배열
 */
export const RoutoSearch = async (value) => {
  try {
    // findPlaceFromText 함수를 호출하여 검색 결과 가져옴
    const data = await findPlaceFromText(value);
    
    // 검색 결과에서 필요한 데이터 매핑
    return data.result.map((place) => ({
      name: place.title, // 장소 이름
      latitude: place.center.lat, // 위도
      longitude: place.center.lon, // 경도
    }));
  } catch (error) {
    console.error('Error fetching data', error); // 에러 발생 시 콘솔에 로그 출력
  }
};
