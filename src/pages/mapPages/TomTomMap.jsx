import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect, useState, useRef } from 'react';
import End_Point from '../../img/Multi End Point.svg'; // Import your custom End Point icon
import Start_Point from '../../img/Multi Start Point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css';

const colors = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#00FFFF',
  '#FF00FF',
  '#FFA500',
  '#00FF80',
  '#7FFFFF',
  '#80D000',
  '#0080FF',
  '#FF0800',
  '#FFA700',
  '#80D100',
  '#807FFF',
  '#888888',
  '#00AA00',
  '#7FFF08',
  '#888800',
  '#008700',
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
    return { lat: parseFloat(lat), lng: parseFloat(lng) };
  }
  return { lat: defaultLat, lng: defaultLng };
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

      markerRef.current = new tt.Marker()
        .setLngLat([center.lng, center.lat])
        .addTo(mapRef.current);

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
              checkedNodes.some((node) => node.file_id === route.file_id),
            );

      // Filter spaceFullCoords based on checkedNodes (if no checked nodes, show all)
      const spacesToDraw =
        checkedNodes.length === 0
          ? validSpaceFullCoords
          : validSpaceFullCoords.filter((space) =>
              checkedNodes.some((node) => node.file_id === space.file_id),
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
  ) => {
    // Create a copy of routeFullCoords to avoid mutating the original array
    let routesWithNulls = [...routeFullCoords];

    // Insert null at each deactivated index
    deactivatedRoutes.forEach((index) => {
      if (index < routesWithNulls.length) {
        routesWithNulls.splice(index, 0, null);
      } else {
        routesWithNulls.push(null); // In case index is beyond the array length
      }
    });

    // Reconstruct the array to replace nulls with the original values if reactivated
    routesWithNulls = routesWithNulls.map((route, index) => {
      // If the original index in deactivatedRoutes does not contain the current index,
      // it means this position was not meant to remain null and can be replaced by the original value
      if (
        route === null &&
        !deactivatedRoutes.includes(index) &&
        routeFullCoords[index] !== undefined
      ) {
        return routeFullCoords[index];
      }
      return route; // Otherwise, keep the original value or null as intended
    });

    return routesWithNulls;
  };

  /**
   * Draws multiple routes based on the checkedNodes.
   * If all nodes are checked, show all routes.
   * If some nodes are unchecked, only show the checked routes.
   * @param {Object} map - The TomTom map instance
   * @param {Array} routeFullCoords - The array of all route objects with coordinates
   */
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
      routeFullCoords,
    );
    console.log('Deactivated route indices:', deactivatedRoutes);

    // Create a new array with nulls inserted at deactivated indices
    const routesWithNulls = insertNullsAtDeactivatedIndices(
      routeFullCoords,
      deactivatedRoutes,
    );

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
          'line-width': 6,
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
          'Invalid origin or destination coordinates for clicked node.',
        );
      }
    }
  }, [clickedNode]);

  return <div id="map-container" className="map" />;
}
