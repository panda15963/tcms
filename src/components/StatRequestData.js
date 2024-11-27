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
    const data = await StatLogService.LIVE_TC();
    if (!data) {
      throw new Error('No data received for LIVE_TC.');
    }
    return data;
  } catch (error) {
    console.error('Error fetching live TC data:', error.message);
    // Provide a default fallback value if needed
    return { message: 'Error fetching data', data: [] };
  }
};

const LIVE_TOOL = async () => {
  try {
    const data = await StatLogService.LIVE_TOOL();
    if (!data) {
      throw new Error('No data received for LIVE_TOOL.');
    }
    return data;
  } catch (error) {
    console.error('Error fetching live tool data:', error.message);
    // Provide a default fallback value if needed
    return { message: 'Error fetching data', data: [] };
  }
};

const TOOL_LOGS = async (inputCond) => {
  try {
    return await StatLogService.TOOL_LOGS({ cond: inputCond });
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
