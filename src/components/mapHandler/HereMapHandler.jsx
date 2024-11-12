import React from 'react';
import HereMap from '../../pages/mapPages/HereMap';

export default function HereMapHandler({
  selectedCoords,
  hereLocation,
  routeFullCoords = [], // Set default value as empty array
  checkedNode = [], // Set default value as empty array
  clickedNode,
  routeColors = () => {},
  spaceFullCoords,
}) {

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
      {selectedCoords && hereLocation ? (
        <HereMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={hereLocation}
          routeFullCoords={filteredRoutes} // Pass only filtered routes
          clickedNode={clickedNode}
          routeColors={routeColors}
          spaceFullCoords={filteredSpaces}
          checkedNode={checkedNode}
        />
      ) : selectedCoords && hereLocation ? (
        <HereMap
          lat={selectedCoords.lat}
          lng={selectedCoords.lng}
          locationCoords={hereLocation}
          routeColors={routeColors} // Pass the color handler here too
          spaceFullCoords={filteredSpaces}
          checkedNode={checkedNode}
        />
      ) : !selectedCoords && hereLocation ? (
        <HereMap
          locationCoords={hereLocation}
          routeFullCoords={filteredRoutes} // Pass only filtered routes
          clickedNode={clickedNode}
          routeColors={routeColors} // Ensure this is passed here
          spaceFullCoords={filteredSpaces}
          checkedNode={checkedNode}
        />
      ) : hereLocation ? (
        <HereMap
          locationCoords={hereLocation}
        />
      ) : (
        <Error message="지도를 표시할 수 없습니다. 위치 정보가 없습니다." />
      )}
    </>
  );
}
