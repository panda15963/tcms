import axios from 'axios';

const apiKey = process.env.REACT_APP_TOMTOM_MAP_API;

export const TomTomSearch = async (value) => {
  try {
    const response = await axios.get(
      `https://api.tomtom.com/search/2/search/${value}.json?key=${apiKey}`,
    );
    console.log(response)
    return response.data.results;
  } catch (error) {
    console.error('TomTomSearch error: ', error);
  }
};
