import { axiosInstance } from '../server/axios_config';

/**
 * 맵 데이터 관련 요청 서비스
 */
const MapLogService = {
  /**
   * 주요 국가 데이터 요청
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  MAIN_COUNTRY: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * 주요 기능 데이터 요청
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  MAIN_FEATURE: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * 주요 타겟 데이터 요청
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  MAIN_TARGET: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * 주요 태그 데이터 요청
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  MAIN_TAG: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * 메타 데이터 조회 (특정 ID)
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_META: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * FIND_META_10009: 특정 메타 데이터를 조회
   * @param {Object} obj - 요청 조건(cond)과 취소 토큰(cancelToken)을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_META_10009: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * FIND_META_10100: 특정 메타 데이터를 조회
   * @param {Object} obj - 요청 조건(cond)과 취소 토큰(cancelToken)을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_META_10100: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * FIND_TCCFG_10003: 특정 TC 설정 데이터를 조회
   * @param {Object} obj - 요청 조건(cond)과 취소 토큰(cancelToken)을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_TCCFG_10003: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * FIND_SAMEORIGIN_TCCFG: 동일 출처 TC 설정 데이터를 조회
   * @param {Object} obj - 요청 조건(cond)과 취소 토큰(cancelToken)을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_SAMEORIGIN_TCCFG: async (obj) => {
    console.log('obj', obj);

    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * 공간 데이터 보간 요청
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  SPACE_INTERPOLATION: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * TCCFG 데이터 다운로드
   * @param {Object} obj - 요청 조건(cond) 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  DOWNLOAD_TCCFG: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  /**
   * 공간 데이터 검색 요청
   * @param {Object} obj - 요청 객체로, 조건(cond)과 취소 토큰(cancelToken)을 포함
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_SPACE: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await axiosInstance
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
  },
  /**
   * 메타 ID를 기반으로 메타 데이터 조회
   * @param {Object} obj - 요청 조건(cond), meta_id 및 취소 토큰(cancelToken)
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FIND_META_ID: async (obj) => {
    const { cond, cancelToken } = obj;
    const { meta_id, ...otherParams } = cond; // cond에서 meta_id 추출, 나머지 파라미터는 유지

    const result = await axiosInstance
      .get(`/find/meta/${meta_id}`, {
        params: otherParams, // 나머지 파라미터는 쿼리스트링으로 전달
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

    console.log('[FIND_META_ID] result ==>', result);

    return result.data;
  },
};

export default MapLogService;
