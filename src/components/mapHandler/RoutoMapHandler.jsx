import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoutoMap from '../../pages/mapPages/RoutoMap';
import Error from '../alerts/Error';

export default function RoutoMapHandler({
  selectedCoords,
  routoLocation,
  routeFullCoords = [], // Set default value as empty array
  country,
  checkedNode = [], // Set default value as empty array
  clickedNode,
}) {
  const [error, setError] = useState(false);
  const [errorValue, setErrorValue] = useState('');
  const { t } = useTranslation();

  // Function to check if country array contains any value other than "KOR"
  const containsNonKOR = (countries) => {
    return countries?.some((item) => item !== 'KOR'); // Add optional chaining to avoid null errors
  };

  // Show error if country contains non-KOR values
  useEffect(() => {
    if (Array.isArray(country) && containsNonKOR(country)) {
      setError(true);
      setErrorValue(t('RoutoMap.KoreaRegionOnlyError'));
    } else {
      setError(false);
      setErrorValue('');
    }
  }, [country, t]);

  // Extract file_id from checkedNode and filter routeFullCoords
  const checkedFileIds = checkedNode?.map(node => node.file_id); // Add optional chaining
  const filteredRoutes = routeFullCoords?.filter(route =>
    checkedFileIds?.includes(route.file_id) // Add optional chaining
  ) || []; // Ensure filteredRoutes is at least an empty array

  return (
    <>
      {error && <Error errorMessage={errorValue} />}
      {selectedCoords && routoLocation ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
          checkedNodes={checkedNode} // Pass checked nodes
          routeFullCoords={filteredRoutes} // Pass filtered routes
          clickedNode={clickedNode}
        />
      ) : selectedCoords && routoLocation ? (
        <RoutoMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={routoLocation}
        />
      ) : !selectedCoords && routoLocation ? (
        <RoutoMap
          locationCoords={routoLocation}
          checkedNodes={checkedNode} // Pass checked nodes
          routeFullCoords={filteredRoutes} // Pass filtered routes
          clickedNode={clickedNode}
        />
      ) : routoLocation ? (
        <RoutoMap locationCoords={routoLocation} />
      ) : (
        <div>지도를 표시할 수 없습니다. 위치 정보가 없습니다.</div>
      )}
    </>
  );
}