import axios from 'axios';
import useAuth from '../hooks/useAuth';

const API_BASE_URL = process.env.REACT_APP_BASE_URL; // 환경 변수에서 API 서버의 기본 URL 가져오기
const MAP_API_PORT = process.env.REACT_APP_MAP_API_PORT;
const STAT_API_PORT = process.env.REACT_APP_STAT_API_PORT;

const TIME_OUT = process.env.REACT_APP_TIMEOUT; // 환경 변수에서 요청 타임아웃 설정 가져오기

let isRefreshing = false;

// 인증이 필요한 요청을 위한 Axios 인스턴스 생성
export const axiosInstance = axios.create({
  /**
   * [Swagger API Server]
   * 이 인스턴스는 기본적으로 인증 토큰을 포함한 요청에 사용됩니다.
   */
  baseURL: `${API_BASE_URL}:${MAP_API_PORT}/api`, // API 서버의 기본 URL
  timeout: TIME_OUT, // 요청 타임아웃 설정
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 요청 허용
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', // 허용되는 HTTP 메서드
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept', // 허용되는 헤더 목록
    'Access-Control-Allow-Credentials': true, // 자격 증명(쿠키, 인증 정보 등) 허용
  },
});

export const axiosInstanceStat = axios.create({
  /**
   * [Swagger API Server]
   * 이 인스턴스는 기본적으로 인증 토큰을 포함한 요청에 사용됩니다.
   */
  baseURL: `${API_BASE_URL}:${STAT_API_PORT}/api`, // API 서버의 기본 URL
  timeout: TIME_OUT, // 요청 타임아웃 설정
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 요청 허용
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', // 허용되는 HTTP 메서드
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept', // 허용되는 헤더 목록
    'Access-Control-Allow-Credentials': true, // 자격 증명(쿠키, 인증 정보 등) 허용
  },
});

// export const changePortStat = () => {
//   axiosInstance.defaults.baseURL = `${API_BASE_URL}:${STAT_API_PORT}/api`;
// };

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    // console.log('🚀 ~ setTokenToInstance ~ token:', token);
    if (token) {
      // console.log('SETTING Bearer token ==> ', token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('~ Interceptor ~ Token not found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstanceStat.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ACCESS_TOKEN');
    // console.log('🚀 ~ setTokenToInstance ~ token:', token);
    if (token) {
      // console.log('SETTING Bearer token ==> ', token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('~ Interceptor ~ Token not found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token expiration or other errors
    if (error.response && error.response.status === 401) {
      console.error('토큰 만료되었습니다.');
      if (!isRefreshing) {
        isRefreshing = true;
        console.log('토큰 만료되었습니다.');
        alert('세션이 만료되었습니다. 다시 로그인해 주세요.');

        window.location.href = '/';
        localStorage.removeItem('user');
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('REFRESH_TOKEN');

        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
