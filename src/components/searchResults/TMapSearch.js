const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    appKey: 'l7xx8a1100ddc88c4681acdf968333275cc4',
  },
};

const TMapSearch = async (value) => {
  try {
    const response = await fetch(
      `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${value}&resCoordType=WGS84GEO&searchType=all&count=10&page=1&appKey=l7xx8a1100ddc88c4681acdf968333275cc4`,      
      options,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.searchPoiInfo.pois.poi) {
      return data.searchPoiInfo.pois.poi.map((place) => ({
        name: place.name,
        latitude: place.frontLat,
        longitude: place.frontLon,
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching TMap search results:', error);
    return [];
  }
};

export { TMapSearch };
