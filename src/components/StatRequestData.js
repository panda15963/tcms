import StatLogService from '../service/StatLogService';

const EXECUTION_COUNT_TOOL = async (inputCond) => {
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
    console.error('Error in EXECUTION_COUNT:', error);
    return null;
  }
};

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
    console.error('Error in EXECUTION_COUNT:', error);
    return null;
  }
};

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
    console.error('Error:', error);
    return null;
  }
};

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
    if (typeof result === 'object') {
      console.log('Result is already parsed as JSON:', result);
      return result;
    }
    if (!result) {
      throw new Error('No data received for LIVE_TC.');
    }
    return result;
  } catch (error) {
    console.error('Error fetching live TC data:', error.message);
    return { message: 'Error fetching data', data: [] };
  }
};

const LIVE_TOOL = async () => {
  try {
    const result = await StatLogService.LIVE_TOOL();

    if (!result) {
      throw new Error('No data received for LIVE_TOOL.');
    }

    if (typeof result === 'string') {
      // 문자열을 JSON 형식으로 변환
      const formattedResponse = result.replace(
        /ToolLiveInfoResponse\((.*?)\)/g,
        (_, content) => {
          const formattedContent = content
            .split(/,\s?/) // 쉼표로 구분된 데이터 분리
            .map((pair) => {
              const [key, value] = pair.split('=');
              if (!key || value === undefined || value === '') {
                // 값이 없거나 잘못된 경우 null로 설정
                return `"${key.trim()}":null`;
              }
              const formattedValue =
                value === 'null' || !isNaN(Number(value))
                  ? value // 숫자 또는 null 처리
                  : `"${value}"`; // 문자열 처리
              return `"${key.trim()}":${formattedValue.trim()}`;
            })
            .filter(Boolean) // 유효하지 않은 값 제거
            .join(', ');

          return `{${formattedContent}}`;
        }
      );

      try {
        // JSON 파싱
        return JSON.parse(formattedResponse);
      } catch (parseError) {
        console.error('Error parsing formatted response:', parseError.message);
        console.error('Formatted Response:', formattedResponse);
        throw new Error('Failed to parse formatted response.');
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching live tool result:', error.message);
    // Provide a default fallback value if needed
    return { message: 'Error fetching result', data: [] };
  }
};

const TOOL_LOGS = async (inputCond) => {
  try {
    const result = await StatLogService.TOOL_LOGS({ cond: inputCond });
    if (typeof result === 'string') {
      const formattedResponse = result.replace(
        /UploadLogResponse\((.*?)\)/g,
        (_, content) => {
          const keyValuePairs = content.split(', ').map((pair) => {
            const [key, value] = pair.split('=');
            // 값이 없을 경우 null로 처리
            const formattedValue =
              value === undefined || value === '' || value === 'null'
                ? null
                : isNaN(value) || value.trim() === ''
                ? `"${value.trim()}"`
                : value;
            return `"${key}":${formattedValue}`;
          });

          // Key-value 쌍을 JSON으로 묶음
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

const TOOL_SETTINGS = async (inputCond) => {
  try {
    return await StatLogService.TOOL_SETTINGS({ cond: inputCond });
  } catch (error) {
    console.error('Error in TOOL_SETTINGS:', error);
    return null;
  }
};

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
    console.error('Error in TOOL_SETTINGS:', error);
    return null;
  }
};

const PCNAMES = async () => {
  try {
    return await StatLogService.PCNAMES();
  } catch (error) {
    console.error('Error in TOOL_SETTINGS:', error);
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
