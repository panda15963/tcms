const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
};

export const TMapSearch = async (value) => {
  try {
    const response = await fetch(
      `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${encodeURIComponent(value)}&resCoordType=WGS84GEO&searchType=all&count=10&page=1&appKey=l7xx8a1100ddc88c4681acdf968333275cc4`,      
      options,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data.searchPoiInfo.pois.poi)) {
      return data.searchPoiInfo.pois.poi.map((place) => ({
        name: place.name,
        latitude: place.frontLat,
        longitude: place.frontLon,
      }));
    } else {
      console.log('No places found or the data format is incorrect');
      return [];
    }
  }
  catch (error) {
    console.error('Error:', error);
  }
};