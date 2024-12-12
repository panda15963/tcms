// import axios from 'axios';
// import Cookies from 'js-cookie';

// const statBaseURL = process.env.REACT_APP_STATBASEURL; // 환경 변수에서 API 서버의 기본 URL 가져오기
// const timeout = process.env.REACT_APP_TIMEOUT; // 환경 변수에서 요청 타임아웃 설정 가져오기

// // 인증이 필요한 요청을 위한 Axios 인스턴스 생성
// export const axiosInstance = axios.create({
//   /**
//    * [Swagger API Server]
//    * 이 인스턴스는 기본적으로 인증 토큰을 포함한 요청에 사용됩니다.
//    */
//   baseURL: statBaseURL, // API 서버의 기본 URL
//   timeout: timeout, // 요청 타임아웃 설정
//   headers: {
//     Authorization: `Bearer ${Cookies.get('access-token')}`, // 쿠키에서 토큰을 가져와 인증 헤더에 포함
//     'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 요청 허용
//     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', // 허용되는 HTTP 메서드
//     'Access-Control-Allow-Headers':
//       'Origin, X-Requested-With, Content-Type, Accept', // 허용되는 헤더 목록
//     'Access-Control-Allow-Credentials': true, // 자격 증명(쿠키, 인증 정보 등) 허용
//   },
// });

// // 인증이 필요 없는 요청을 위한 Axios 인스턴스 생성
// export const axiosInstance = axios.create({
//   /**
//    * [Swagger API Server]
//    * 이 인스턴스는 인증이 필요 없는 요청에 사용됩니다.
//    */
//   baseURL: statBaseURL, // API 서버의 기본 URL
//   timeout: timeout, // 요청 타임아웃 설정
//   headers: {
//     'Content-Type': 'application/json', // JSON 요청을 위한 Content-Type 헤더
//     'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 요청 허용
//     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', // 허용되는 HTTP 메서드
//     'Access-Control-Allow-Headers':
//       'Origin, X-Requested-With, Content-Type, Accept', // 허용되는 헤더 목록
//     'Access-Control-Allow-Credentials': true, // 자격 증명 허용
//   },
// });

// // 파일 업로드와 같은 multipart 요청을 위한 Axios 인스턴스 생성
// export const axiosMultipartInstance = axios.create({
//   /**
//    * [Swagger API Server]
//    * 이 인스턴스는 파일 업로드와 같이 multipart/form-data 형식의 요청에 사용됩니다.
//    */
//   baseURL: statBaseURL, // API 서버의 기본 URL
//   timeout: timeout, // 요청 타임아웃 설정
//   headers: {
//     Authorization: `Bearer ${Cookies.get('access-token')}`, // 쿠키에서 토큰을 가져와 인증 헤더에 포함
//     'Content-Type': 'multipart/form-data', // 파일 업로드를 위한 Content-Type 설정
//     'Access-Control-Allow-Origin': '*', // 모든 도메인에서의 요청 허용
//     'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', // 허용되는 HTTP 메서드
//     'Access-Control-Allow-Headers':
//       'Origin, X-Requested-With, Content-Type, Accept', // 허용되는 헤더 목록
//     'Access-Control-Allow-Credentials': true, // 자격 증명 허용
//   },
// });

// export const setTokenToInstance = () => {
//   axiosInstance.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem('ACCESS_TOKEN');
//       console.log('🚀 ~ setTokenToInstance ~ token:', token);
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );
// };
