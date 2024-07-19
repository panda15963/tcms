import axios from 'axios';

const API_URL = 'https://api.routo.com/v1/places/findplacefromtext';
const API_KEY = process.env.REACT_APP_ROUTTO_MAP_API;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const findPlaceFromText = async (query) => {
  try {
    const response = await apiClient.get('', {
      params: { input: query, key: API_KEY },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data', error);
    throw error;
  }
};

export const RoutoSearch = async (value) => {
  try {
    const data = await findPlaceFromText(value);
    return data.result.map(
      (place) => ({
        name: place.title,
        latitude: place.center.lat,
        longitude: place.center.lon,
      })
    )
  } catch (error) {
    console.error('Error fetching data', error);
  }
};
