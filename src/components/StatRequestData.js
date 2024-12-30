import StatLogService from '../service/StatLogService';

/**
 * EXECUTION_COUNT_TOOL
 * @description 특정 조건으로 실행 카운트를 조회
 * @param {Object} inputCond - 조회 조건
 * @returns {Promise<Object|null>} 실행 카운트 데이터 또는 null
 */
const EXECUTION_COUNT_TOOL = async (inputCond) => {
  console.log('inputCond ===>', inputCond);

  try {
    const result = await StatLogService.EXECUTION_COUNT({ cond: inputCond });
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /ToolExecCountResponse\((.*?)\)/g,
        (_, content) =>
          `{${content
            .split(', ')
            .map((pair) => {
              const [key, value] = pair.split('=');
              const formattedValue =
                value === 'null' || !isNaN(value) ? value : `"${value}"`;
              return `"${key}":${formattedValue}`;
            })
            .join(', ')}}`
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error in EXECUTION_COUNT_TOOL:', error);
    return null;
  }
};

/**
 * EXECUTION_COUNT_VERSION
 * @description 특정 조건으로 실행 카운트(버전별)를 조회
 * @param {Object} inputCond - 조회 조건
 * @returns {Promise<Object|null>} 실행 카운트 데이터 또는 null
 */
const EXECUTION_COUNT_VERSION = async (inputCond) => {
  try {
    const result = await StatLogService.EXECUTION_COUNT({ cond: inputCond });
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /ToolExecCountResponse\((.*?)\)/g,
        (_, content) =>
          `{${content
            .split(', ')
            .map((pair) => {
              const [key, value] = pair.split('=');
              const formattedValue =
                value === 'null' || !isNaN(value) ? value : `"${value}"`;
              return `"${key}":${formattedValue}`;
            })
            .join(', ')}}`
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error in EXECUTION_COUNT_VERSION:', error);
    return null;
  }
};

/**
 * FUNCTION_COUNT
 * @description 특정 조건으로 함수 카운트를 조회
 * @param {Object} inputCond - 조회 조건
 * @returns {Promise<Object|null>} 함수 카운트 데이터 또는 null
 */
const FUNCTION_COUNT = async (inputCond) => {
  try {
    const result = await StatLogService.FUNCTION_COUNT({ cond: inputCond });
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /ToolExecCountResponse\((.*?)\)/g,
        (_, content) =>
          `{${content
            .split(', ')
            .map((pair) => {
              const [key, value] = pair.split('=');
              const formattedValue =
                value === 'null' || !isNaN(value) ? value : `"${value}"`;
              return `"${key}":${formattedValue}`;
            })
            .join(', ')}}`
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error in FUNCTION_COUNT:', error);
    return null;
  }
};

/**
 * LIVE_TC
 * @description 실시간 TC 정보를 조회
 * @returns {Promise<Object|null>} 실시간 TC 데이터 또는 null
 */
const LIVE_TC = async () => {
  try {
    const result = await StatLogService.LIVE_TC();
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /TcToolLiveInfoResponse\((.*?)\)/g,
        (_, content) => {
          const formattedContent = content
            .split(', ')
            .map((pair) => {
              const [key, value] = pair.split('=');
              const formattedValue =
                value === 'null' || !isNaN(Number(value))
                  ? value
                  : `"${value}"`;
              return `"${key}":${formattedValue}`;
            })
            .join(', ');
          return `{${formattedContent}}`;
        }
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error fetching live TC data:', error.message);
    return { message: 'Error fetching data', data: [] };
  }
};

/**
 * LIVE_TOOL
 * @description 실시간 도구 정보를 조회
 * @returns {Promise<Object|null>} 실시간 도구 데이터 또는 null
 */
const LIVE_TOOL = async () => {
  try {
    const result = await StatLogService.LIVE_TOOL();
    if (!result) {
      throw new Error('No data received for LIVE_TOOL.');
    }
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /ToolLiveInfoResponse\((.*?)\)/g,
        (_, content) => {
          const formattedContent = content
            .split(/,\s?/)
            .map((pair) => {
              const [key, value] = pair.split('=');
              if (!key || value === undefined || value === '') {
                return `"${key.trim()}":null`;
              }
              const formattedValue =
                value === 'null' || !isNaN(Number(value))
                  ? value
                  : `"${value}"`;
              return `"${key.trim()}":${formattedValue.trim()}`;
            })
            .filter(Boolean)
            .join(', ');
          return `{${formattedContent}}`;
        }
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error fetching live tool result:', error.message);
    return { message: 'Error fetching result', data: [] };
  }
};

/**
 * TOOL_LOGS
 * @description 도구 로그 조회
 * @param {Object} inputCond - 조회 조건
 * @returns {Promise<Object|null>} 도구 로그 데이터 또는 null
 */
const TOOL_LOGS = async (inputCond) => {
  try {
    const result = await StatLogService.TOOL_LOGS({ cond: inputCond });
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /UploadLogResponse\((.*?)\)/g,
        (_, content) => {
          const keyValuePairs = content.split(', ').map((pair) => {
            const [key, value] = pair.split('=');
            const formattedValue =
              value === undefined || value === '' || value === 'null'
                ? null
                : isNaN(value) || value.trim() === ''
                ? `"${value.trim()}"`
                : value;
            return `"${key}":${formattedValue}`;
          });
          return `{${keyValuePairs.join(', ')}}`;
        }
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error in TOOL_LOGS:', error);
    return null;
  }
};

/**
 * TOOL_SETTINGS
 * @description 도구 설정 조회
 * @param {Object} inputCond - 조회 조건
 * @returns {Promise<Object|null>} 도구 설정 데이터 또는 null
 */
const TOOL_SETTINGS = async (inputCond) => {
  try {
    return await StatLogService.TOOL_SETTINGS({ cond: inputCond });
  } catch (error) {
    console.error('Error in TOOL_SETTINGS:', error);
    return null;
  }
};

/**
 * TOOLNAMES
 * @description 도구 이름 조회
 * @returns {Promise<Object|null>} 도구 이름 데이터 또는 null
 */
const TOOLNAMES = async () => {
  try {
    const result = await StatLogService.TOOLNAMES();
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /Toolnametbl\((.*?)\)/g,
        (_, content) =>
          `{${content
            .split(', ')
            .map((pair) => {
              const [key, value] = pair.split('=');
              const formattedValue =
                value === 'null' || !isNaN(value) ? value : `"${value}"`;
              return `"${key}":${formattedValue}`;
            })
            .join(', ')}}`
      );
      return JSON.parse(formattedResponse);
    }
    return result;
  } catch (error) {
    console.error('Error in TOOLNAMES:', error);
    return null;
  }
};

/**
 * PCNAMES
 * @description PC 이름 조회
 * @returns {Promise<Object|null>} PC 이름 데이터 또는 null
 */
const PCNAMES = async () => {
  try {
    return await StatLogService.PCNAMES();
  } catch (error) {
    console.error('Error in PCNAMES:', error);
    return null;
  }
};

export {
  EXECUTION_COUNT_TOOL,
  EXECUTION_COUNT_VERSION,
  FUNCTION_COUNT,
  LIVE_TC,
  LIVE_TOOL,
  TOOL_LOGS,
  TOOL_SETTINGS,
  TOOLNAMES,
  PCNAMES,
};
