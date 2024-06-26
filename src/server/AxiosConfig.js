import axios from 'axios';
import Cookies from 'js-cookie';

export const axiosInstance = axios.create({
  /**
   * [LOCALHOST]
   */
  // baseURL: "http://localhost:9090/api",
  /**
   * [개발서버]
   */
  // baseURL: 'https://msps-dev.mobis.co.kr/api',
  /**
   * [운영서버]
   */
  // baseURL: "https://msps.mobis.com/api",
  // baseURL: "https://msps2.mobis.co.kr/api",
  // baseURL: process.env.REACT_APP_BACKEND_URL,
  // timeout: process.env.REACT_APP_API_TIMEOUT,
  /**
   * [Swagger API Server]
   */
  baseURL: 'http://192.168.0.88:8080/api',
  timeout: 300000,
  headers: {
    Authorization: `Bearer ${Cookies.get('access-token')}`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});

export const nonAuthInstance = axios.create({
  /**
   * [LOCALHOST]
   */
  // baseURL: "http://localhost:9090/api",
  /**
   * [개발서버]
   */
  // baseURL: 'https://msps-dev.mobis.co.kr/api',
  /**
   * [운영서버]
   */
  // baseURL: "https://msps.mobis.com/api",
  // baseURL: "https://msps2.mobis.co.kr/api",
  // baseURL: process.env.REACT_APP_BACKEND_URL,
  // timeout: process.env.REACT_APP_API_TIMEOUT,
  /**
   * [Swagger API Server]
   */
  baseURL: 'http://192.168.0.88:8080/api',
  timeout: 300000,
  headers: {
    'Content-Type': 'text/plain;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});

export const axiosMultipartInstance = axios.create({
  /**
   * [LOCALHOST]
   */
  // baseURL: "http://localhost:9090/api",
  /**
   * [개발서버]
   */
  // baseURL: 'https://msps-dev.mobis.co.kr/api',
  /**
   * [운영서버]
   */
  // baseURL: "https://msps.mobis.com/api",
  // baseURL: "https://msps2.mobis.co.kr/api",
  // baseURL: process.env.REACT_APP_BACKEND_URL,
  // timeout: process.env.REACT_APP_API_TIMEOUT,
  /**
   * [Swagger API Server]
   */
  // baseURL: 'http://192.168.0.88:8080/api',
  timeout: 300000,
  headers: {
    Authorization: `Bearer ${Cookies.get('access-token')}`,
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});
