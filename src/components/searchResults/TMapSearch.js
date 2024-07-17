import { useState } from 'react';

const options = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    appKey: 'l7xx8a1100ddc88c4681acdf968333275cc4',
  },
};

const TMapSearch = (value) => {
  const [searchResults, setSearchResults] = useState([]);

  fetch(
    `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${value}&appKey=l7xx8a1100ddc88c4681acdf968333275cc4`,
    options,
  )
    .then((response) => response.json())
    .then((data) => setSearchResults(data.searchPoiInfo.pois.poi))
    .catch((error) => console.error('Error:', error));

  return searchResults;
};

export default TMapSearch;
