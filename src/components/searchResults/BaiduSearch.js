import axios from 'axios';

export const BaiduSearch = async (value) => {
  const url = 'https://api.map.baidu.com/place/v2/search';
  const params = {
    query: value,
    bounds: '85,180,-85,-180',
    output: 'json',
    ak: process.env.REACT_APP_BAIDU_MAP_API,
  };

  try {
    const response = await axios.get(url, { params });
    console.log(response);
    return response.data.results;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
    return [];
  }
};
