import axios from 'axios';
import Cookies from 'js-cookie';

export const axiosInstance = axios.create({
  /**
   * [Swagger API Server]
   */
  baseURL: 'http://192.168.0.88:8080/api',
  timeout: 300000,
  headers: {
    Authorization: `Bearer ${Cookies.get('access-token')}`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});

export const nonAuthInstance = axios.create({
  /**
   * [Swagger API Server]
   */
  baseURL: 'http://210.106.106.80:8080/api',
  
  timeout: 300000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});

export const axiosMultipartInstance = axios.create({
  timeout: 300000,
  headers: {
    Authorization: `Bearer ${Cookies.get('access-token')}`,
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});
