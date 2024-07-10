import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = process.env.REACT_APP_BASEURL;
const timeout = process.env.REACT_APP_TIMEOUT;

export const axiosInstance = axios.create({
  /**
   * [Swagger API Server]
   */
  baseURL: baseURL,
  timeout: timeout,
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
  baseURL: baseURL,  
  timeout: timeout,
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
  /**
   * [Swagger API Server]
   */
  baseURL: baseURL,
  timeout: timeout,
  headers: {
    Authorization: `Bearer ${Cookies.get('access-token')}`,
    'Content-Type': 'multipart/form-data',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Credentials': true,
  },
});
