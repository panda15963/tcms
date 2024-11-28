import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css';

const colors = [
  '#0000FF', // 파란색
  '#00FF00', // 초록색
  '#FF0000', // 빨간색
  '#00FFFF', // 청록색
  '#FFFF00', // 노란색
  '#FF00FF', // 자홍색
  '#0080FF', // 밝은 파란색
  '#80FF00', // 연두색
  '#ff0075', // 빨간색 비슷
  '#98ff98', // 연한 녹색
  '#FFA500', // 주황색
  '#8811FF', // 보라색
  '#8080FF', // 연한 보라색
  '#88FF80', // 밝은 연녹색
  '#ffae00', // 황금색
  '#008828', // 밝은 하늘색
  '#50664e', // 짙은 초록색
  '#790963', // 짙은 보라색
  '#32437a', // 짙은 파란색
  '#415e45', // 짙은 녹색
];

/**
 * 중심 좌표와 마커 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 위도와 경도를 포함한 객체
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);
  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng), isDefault: false };
  }
  return { lat: defaultLat, lng: defaultLng, isDefault: true };
}

/**
 * Parses a coordinate string into an object with lat and lng properties.
 * @param {string} coordString - The coordinate string in the format "lng,lat".
 * @returns {Object|null} - Returns an object {lat, lng} or null if invalid.
 */
const parseCoordinateString = (coordString) => {
  const coordsArray = coordString.split(',').map(parseFloat);
  if (
    coordsArray.length === 2 &&
    !isNaN(coordsArray[0]) &&
    !isNaN(coordsArray[1])
  ) {
    return { lng: coordsArray[0], lat: coordsArray[1] };
  }
  return null;
};

export default function TomTomMap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords, // Use this for drawing routes
  place,
  checkedNodes,
  clickedNode, // Use this to center the map on a clicked route
  spaceFullCoords,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeLayerIds = useRef([]); // Store the route layer IDs to manage multiple routes
  const routeMarkers = useRef([]); // Store the markers for each route (start and end)
  const previousColorsRef = useRef([]);
  const previousRouteRef = useRef([]);
  const [searchMarker, setSearchMarker] = useState(null); // 검색된 마커 상태

  // Update center coordinates whenever lat or lng changes
  useEffect(() => {
    setCenter(calculateCenterAndMarker(lat, lng));
  }, [lat, lng]);

  // TomTom API load and map initialization
  useEffect(() => {
    const initializeMap = () => {
      mapRef.current = tt.map({
        key: process.env.REACT_APP_TOMTOM_MAP_API,
        container: 'map-container',
        center: [center.lng, center.lat],
        zoom: Number(process.env.REACT_APP_ZOOM),
      });

      mapRef.current.on('click', (event) => {
        const { lat, lng } = event.lngLat;
        locationCoords({ lat, lng });
      });

      // 초기 마커 설정 (기본 좌표가 아닌 경우)
      if (!center.isDefault) {
        markerRef.current = new tt.Marker()
          .setLngLat([center.lng, center.lat])
          .addTo(mapRef.current);
      }
      // Wait until the style is fully loaded before drawing routes
      mapRef.current.on('style.load', () => {
        if (routeFullCoords) {
          drawRoutes(mapRef.current, routeFullCoords); // Initial draw, show all routes
        }
      });
    };

    if (!mapRef.current) {
      initializeMap();
    }
  }, [center, routeFullCoords, place]);

  // 검색된 위치에 마커 추가
  useEffect(() => {
    if (searchMarker) {
      searchMarker.remove(); // 이전 마커 제거
    }

    if (lat && lng) {
      const newMarker = new tt.Marker()
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      setSearchMarker(newMarker); // 검색된 마커 상태 업데이트
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 15, // 적절한 줌 레벨
      });
    }
  }, [lat, lng]);

  // Updated Effect for Handling checkedNodes Changes
  useEffect(() => {
    if (mapRef.current) {
      // Ensure routeFullCoords is a valid array
      const validRouteFullCoords = Array.isArray(routeFullCoords)
        ? routeFullCoords
        : [];
      const validSpaceFullCoords = Array.isArray(spaceFullCoords)
        ? spaceFullCoords
        : [];

      // Filter routeFullCoords based on checkedNodes (if no checked nodes, show all)
      const routesToDraw =
        checkedNodes.length === 0
          ? validRouteFullCoords
          : validRouteFullCoords.filter((route) =>
              checkedNodes.some((node) => node.file_id === route.file_id)
            );

      // Filter spaceFullCoords based on checkedNodes (if no checked nodes, show all)
      const spacesToDraw =
        checkedNodes.length === 0
          ? validSpaceFullCoords
          : validSpaceFullCoords.filter((space) =>
              checkedNodes.some((node) => node.file_id === space.file_id)
            );

      // Combine filtered rorouteFullCoords and spaceFullCoords for drawing
      const combinedCoords = [...routesToDraw, ...spacesToDraw];

      // Redraw the routes and spaces on the map
      drawRoutes(mapRef.current, combinedCoords);
    }
  }, [routeFullCoords, checkedNodes, spaceFullCoords]);

  // Clear previous routes and markers function
  const clearRoutesAndMarkers = (map) => {
    // Clear route layers
    if (routeLayerIds.current.length > 0) {
      routeLayerIds.current.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
          map.removeSource(layerId);
        }
      });
      routeLayerIds.current = [];
    }

    // Clear markers
    if (routeMarkers.current.length > 0) {
      routeMarkers.current.forEach((marker) => {
        marker.remove(); // Remove the marker from the map
      });
      routeMarkers.current = [];
    }
  };

  /**
   * Finds deactivated routes by comparing the previous and current route lists.
   * @param {Array} previousRoutes - The previous list of routes.
   * @param {Array} currentRoutes - The current list of routes.
   * @returns {Array} - An array of indices representing the deactivated routes.
   */
  const findDeactivatedRoutes = (previousRoutes, currentRoutes) => {
    // Identify the deactivated routes by comparing the previous and current lists
    const deactivatedRoutes = previousRoutes
      .map((route, index) => {
        // If the route is not in the currentRoutes, it's deactivated
        return currentRoutes.includes(route) ? null : index;
      })
      .filter((index) => index !== null); // Remove null values

    return deactivatedRoutes;
  };

  const insertNullsAtDeactivatedIndices = (
    routeFullCoords,
    deactivatedRoutes,
    removedRoutes = []
  ) => {
    // Create a copy of routeFullCoords to avoid mutating the original array
    let routesWithNulls = [...routeFullCoords];

    // Insert null at each deactivated index and store the original data
    deactivatedRoutes.forEach((index) => {
      if (index < routesWithNulls.length) {
        // Save the original data and its index before inserting null
        removedRoutes.push({ index, data: routesWithNulls[index] });
        routesWithNulls.splice(index, 0, null);
      } else {
        // If the index is beyond the array length, just push null
        routesWithNulls.push(null);
      }
    });

    // 복구된 데이터를 removedRoutes에서 제거하고 제자리에 되돌림
    removedRoutes.forEach(({ index, data }) => {
      if (index < routesWithNulls.length && routesWithNulls[index] === null) {
        // null 자리에 원래 데이터를 복구
        routesWithNulls[index] = data;
      }
    });

    // 복구가 완료된 데이터는 removedRoutes에서 제거
    removedRoutes = removedRoutes.filter(({ index }) => {
      return routesWithNulls[index] === null; // 여전히 null인 경우만 남겨둠
    });

    // 마지막 요소가 중복되었거나 null인 경우 삭제
    if (
      routesWithNulls.length > 1 &&
      routesWithNulls[routesWithNulls.length - 1] ===
        routesWithNulls[routesWithNulls.length - 2]
    ) {
      routesWithNulls.pop();
    } else if (routesWithNulls[routesWithNulls.length - 1] === null) {
      routesWithNulls.pop();
    }

    // 반환된 배열과 복구 후 남은 removedRoutes를 반환
    return { routesWithNulls, removedRoutes };
  };

  /**
   * Draws multiple routes based on the checkedNodes.
   * If all nodes are checked, show all routes.
   * If some nodes are unchecked, only show the checked routes.
   * @param {Object} map - The TomTom map instance
   * @param {Array} routeFullCoords - The array of all route objects with coordinates
   */
  // Update the drawRoutes function
  const drawRoutes = (map, routeFullCoords = []) => {
    if (!map.isStyleLoaded()) {
      map.on('style.load', () => {
        map.once('style.load', () => drawRoutes(map, routeFullCoords));
      });
      return;
    }

    if (!routeFullCoords || !Array.isArray(routeFullCoords)) {
      console.error('Invalid routeFullCoords');
      return;
    }

    // Clear any previous routes, markers, and colors
    clearRoutesAndMarkers(map);
    previousColorsRef.current = []; // Reset the color array for new routes

    // Find deactivated routes
    const deactivatedRoutes = findDeactivatedRoutes(
      previousRouteRef.current,
      routeFullCoords
    );

    // Create a new array with nulls inserted at deactivated indices
    const { routesWithNulls } = insertNullsAtDeactivatedIndices(
      routeFullCoords,
      deactivatedRoutes
    );

    // Ensure routesWithNulls is a valid array
    if (!Array.isArray(routesWithNulls)) {
      console.error('Invalid routesWithNulls');
      return;
    }

    // Update the previous routes reference with the new array (including nulls)
    previousRouteRef.current = routesWithNulls;

    // Loop through the routesWithNulls and draw the routes
    routesWithNulls.forEach((route, index) => {
      if (!route) {
        // Skip if the route is null (indicating a deactivated route)
        return;
      }

      if (!route.coords || route.coords.length === 0) {
        console.error(`Invalid coordinates for route ${index}`);
        return;
      }

      const coordinates = route.coords.map((coord) => [coord.lng, coord.lat]);

      const startMarker = new tt.Marker({
        element: createCustomMarker(Start_Point),
      })
        .setLngLat(coordinates[0])
        .addTo(map);

      const endMarker = new tt.Marker({
        element: createCustomMarker(End_Point),
      })
        .setLngLat(coordinates[coordinates.length - 1])
        .addTo(map);

      routeMarkers.current.push(startMarker, endMarker);

      const geoJsonRoute = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      };

      const newRouteLayerId = `route-${index}-${Date.now()}`;
      routeLayerIds.current.push(newRouteLayerId);

      // Get the color for the current route
      const routeColor = colors[index % colors.length];
      previousColorsRef.current.push(routeColor); // Track the color used for this route

      map.addLayer({
        id: newRouteLayerId,
        type: 'line',
        source: {
          type: 'geojson',
          data: geoJsonRoute,
        },
        paint: {
          'line-color': routeColor,
          'line-width': 5,
        },
      });

      const bounds = new tt.LngLatBounds();
      coordinates.forEach((coord) => {
        bounds.extend(coord);
      });

      map.fitBounds(bounds, { padding: 50 });
    });
  };

  // Helper function to create a custom marker with an image
  const createCustomMarker = (icon) => {
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-marker';
    const img = document.createElement('img');
    img.src = icon;
    img.style.width = '32px'; // Set the desired width
    img.style.height = '32px'; // Set the desired height
    markerElement.appendChild(img);
    return markerElement;
  };

  /**
   * Centers the map on the route using the origin and destination coordinates.
   * @param {Object} map - The TomTom map instance
   * @param {Object} originCoords - Origin coordinates {lat, lng}
   * @param {Object} destinationCoords - Destination coordinates {lat, lng}
   */
  const centerRoute = (map, originCoords, destinationCoords) => {
    const bounds = new tt.LngLatBounds();

    // Extend bounds with the origin and destination coordinates
    bounds.extend([originCoords.lng, originCoords.lat]);
    bounds.extend([destinationCoords.lng, destinationCoords.lat]);

    // Fit the map to the bounds of the route with padding for better visibility
    map.fitBounds(bounds, { padding: 50 });
  };

  // **New Effect to Handle clickedNode and Center the Route**
  useEffect(() => {
    if (clickedNode != null && mapRef.current) {
      const originCoords = parseCoordinateString(clickedNode.start_coord);
      const destinationCoords = parseCoordinateString(clickedNode.goal_coord);

      if (originCoords && destinationCoords) {
        centerRoute(mapRef.current, originCoords, destinationCoords);
      } else {
        console.error(
          'Invalid origin or destination coordinates for clicked node.'
        );
      }
    }
  }, [clickedNode]);

  return (
    <div id="map-container" className="map" style={{ height: '87.8vh' }} />
  );
}
