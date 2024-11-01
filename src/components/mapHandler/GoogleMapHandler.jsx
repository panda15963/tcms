import { useState } from 'react';
import GoogleMap from '../../pages/mapPages/GoogleMap';
import Error from '../alerts/Error';

export default function GoogleMapHandler({
  selectedCoords,
  googleLocation,
  routeFullCoords = null, // Start with null and handle it safely inside the component
  checkedNode = null, // Start with null and handle it safely inside the component
  clickedNode,
  routeColors = () => {},
  spaceFullCoords,
}) {
  const [isError, setIsError] = useState(false); // Error state
  const [errorText, setErrorText] = useState(null); // Error message state

  // Error handling function
  const handleError = (message) => {
    setIsError(true);
    setErrorText(message);
  };

  // Safely extract file_id from checkedNode (use nullish coalescing to ensure it's an array)
  const checkedFileIds = (checkedNode ?? []).map((node) => node.file_id);

  const filteredRoutes = (routeFullCoords ?? []).filter((route) =>
    checkedFileIds.includes(route.file_id),
  );

  const filteredSpaces = (spaceFullCoords ?? []).filter((space) =>
    checkedFileIds.includes(space.file_id),
  );

  return (
    <>
      {isError && <Error errorMessage={errorText} />}
      {selectedCoords && googleLocation ? (
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
          routeFullCoords={filteredRoutes} // Pass only filtered routes
          clickedNode={clickedNode}
          error={handleError}
          routeColors={routeColors}
          spaceFullCoords={filteredSpaces}
        />
      ) : selectedCoords && googleLocation ? (
        <GoogleMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={googleLocation}
          error={handleError} // Pass the error handling function
          routeColors={routeColors} // Pass the color handler here too
          spaceFullCoords={filteredSpaces}
        />
      ) : !selectedCoords && googleLocation ? (
        <GoogleMap
          locationCoords={googleLocation}
          routeFullCoords={filteredRoutes} // Pass only filtered routes
          clickedNode={clickedNode}
          error={handleError} // Pass the error handling function
          routeColors={routeColors} // Ensure this is passed here
          spaceFullCoords={filteredSpaces}
        />
      ) : googleLocation ? (
        <GoogleMap
          locationCoords={googleLocation}
          error={handleError} // Pass the error handling function
        />
      ) : (
        <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />
      )}
    </>
  );
}
