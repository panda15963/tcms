import { Download } from 'heroicons-react';
import { axiosInstance, nonAuthInstance } from '../server/AxiosConfig';

const logService = {
  MAIN_COUNTRY: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get('/main/country', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  MAIN_FEATURE: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get('/main/feature', cond, {
        cancelToken,
      })
      // .get('/main/feature', {
      //   withCredentials: true,
      //   cancelToken: cancelToken,
      //   data: cond,
      // })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  MAIN_TARGET: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get('/main/target', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  MAIN_TAG: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get('/main/tag', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  FIND_META: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/find/findMeta/10003', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  FIND_META_10009: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/find/findMeta/10009', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  FIND_META_10100: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/find/findMeta/10100', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  FIND_TCCFG_10003: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/find/findTccfg/10003', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  FIND_SAMEORIGIN_TCCFG: async (obj) => {
    console.log('obj', obj);

    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get('/find/sameorigin/tccfg', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  },
  SPACE_INTERPOLATION: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get(`/space/interpolation/${cond.file_id}`, {
        cancelToken,
        params: cond, // cond의 다른 값들은 query params로 사용 가능
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 요청이 취소된 경우 처리
          return console.log('취소', error);
        }
        return error;
      });

    return result.data;
  },
  DOWNLOAD_TCCFG: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .get(`/download/tccfg`, {
        cancelToken,
        params: cond, // cond의 다른 값들은 query params로 사용 가능
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 요청이 취소된 경우 처리
          return console.log('취소', error);
        }
        return error;
      });

    return result.data;
  },
  FIND_SPACE: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/find/space', cond, {
        cancelToken,
      })
      .catch((error) => {
        console.log('error', error);
        if (error.response) {
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.response;
        } else if (error.request) {
          // 응답이 오지 않은 경우 처리
          alert('처리에 실패했습니다.\n확인 후 다시 처리해 주십시오.');
          return error.request;
        } else if (axiosInstance.isCancel(error)) {
          // 취소되면 이곳이 발동된다.
          // axiosInstance 요청이 취소되어버린경우 처리
          return console.log('취소', error);
        }
        // return rejectWithValue(error.response.data);
        return error;
      });

    return result.data;
  }
};

export default logService;
