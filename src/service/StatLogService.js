import { axiosInstance, nonAuthInstance } from '../server/StatAxiosConfig';

/**
 * 통계 및 정보 요청 서비스
 */
const StatLogService = {
  /**
   * 도구 설정 데이터 요청
   * @param {Object} obj - 조건 및 취소 토큰을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  TOOL_SETTINGS: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/statistics/tool-settings', cond, {
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
   * 도구 로그 데이터 요청
   * @param {Object} obj - 조건 및 취소 토큰을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  TOOL_LOGS: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/statistics/tool-logs', cond, {
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
   * 기능 사용 횟수 데이터 요청
   * @param {Object} obj - 조건 및 취소 토큰을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  FUNCTION_COUNT: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/statistics/function-count', cond, {
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
   * 실행 횟수 데이터 요청
   * @param {Object} obj - 조건 및 취소 토큰을 포함한 객체
   * @returns {Promise<Object>} - API 응답 데이터
   */
  EXECUTION_COUNT: async (obj) => {
    const { cond, cancelToken } = obj;
    const result = await nonAuthInstance
      .post('/statistics/execution-count', cond, {
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
   * 실시간 도구 데이터 요청
   * @returns {Promise<Object>} - API 응답 데이터
   */
  LIVE_TOOL: async () => {
    const result = await nonAuthInstance
      .get('/statistics/live-tool')
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
   * 실시간 TC 데이터 요청
   * @returns {Promise<Object>} - API 응답 데이터
   */
  LIVE_TC: async () => {
    const result = await nonAuthInstance
      .get('/statistics/live-tc')
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
   * PC 이름 목록 요청
   * @returns {Promise<Object>} - API 응답 데이터
   */
  PCNAMES: async () => {
    const result = await nonAuthInstance.get('/info/pcnames').catch((error) => {
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
   * 도구 이름 목록 요청
   * @returns {Promise<Object>} - API 응답 데이터
   */
  TOOLNAMES: async () => {
    const result = await nonAuthInstance
      .get('/info/toolnames')
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
};

export default StatLogService;
