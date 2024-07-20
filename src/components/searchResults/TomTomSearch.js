import axios from 'axios';

const apiKey = process.env.REACT_APP_TOMTOM_MAP_API;

const typeList = ['Geography', 'Street', 'POI'];

export const TomTomSearch = async (value) => {
  try {
    const response = await axios.get(
      `https://api.tomtom.com/search/2/search/${value}.json?key=${apiKey}`,
    );
    if (response.data.results.length) {
      return response.data.results
        .filter((place) => typeList.includes(place.type))
        .map((place) => ({
          name: place.poi ? place.poi.name : place.address.freeformAddress,
          latitude: place.position.lat,
          longitude: place.position.lon,
        }));
    }
  } catch (error) {
    console.error('TomTomSearch error: ', error);
  }
};
