import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect, useState, useRef } from 'react';
import End_Point from '../../img/Multi End Point.svg'; // Import your custom End Point icon
import Start_Point from '../../img/Multi Start Point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css';

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
  routeColors = () => {},
  spaceFullCoords,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeLayerIds = useRef([]); // Store the route layer IDs to manage multiple routes
  const routeMarkers = useRef([]); // Store the markers for each route (start and end)
  const previousColorsRef = useRef([]);

  const colors = [
    '#cd5c5c',
    '#176347',
    '#ffa07a',
    '#8b4513',
    '#faf0e6',
    '#faebd7',
    '#ffefdS',
    '#fdfSe6',
    '#fff8de',
    '#eeeBaa',
    '#ffffe0',
    '#6b8e23',
    '#b0e0e6',
    '#87cefa',
    '#778899',
    '#bOcdde',
    '#e6e6fa',
    '#0000cd',
    '#7b68ee',
    '#4b0082',
    '#dabfd8',
    '#8b008D',
    '#c71585',
    '#db7093',
    '#696969',
    '#292929',
    '#fffafa',
    '#a52a2a',
    '#ff0000',
    '#e9967a',
    '#a0522d',
    '#f4a460',
    '#ffedc4',
    '#d2b48c',
    '#ffedb5',
    '#fffafo',
    '#ffd700',
    '#bdb76b',
    '#fafad2',
    '#9acd32',
    '#7cfc00',
    '#008000',
    '#ffb6c1',
    '#00ff7F',
    '#7fffda',
    '#fOffff',
    '#2fafaf',
    '#00ffff',
    '#add8e6',
    '#4682b4',
    '#778899',
    '#6495ed',
    '#191970',
    '#0000fF',
    '#9370db',
    '#9932cc',
    '#ddaddd',
    '#ff00ff',
    '#171493',
    '#dc143c',
    '#696969',
    '#a9a9a9',
    '#tdedede',
    '#bc8I8f',
    '#b22222',
    '#ffedel',
    '#ff7f50',
    '#fffSee',
    '#ffdab9',
    '#ff8c00',
    '#ffdead',
    '#ffa500',
    '#b8860b',
    '#fffacd',
    '#ffffTO',
    '#808000',
    '#556b2f',
    '#f0Fff0',
    '#228522',
    '#00ff00',
    '#f5fffa',
    '#40e0d0',
    '#eofiff',
    '#008080',
    '#00ced1',
    '#00bfff',
    '#f0f8ff',
    '#708090',
    '#4169e1',
    '#000080',
    '#6a5acd',
    '#663399',
    '#9400d3',
    '#eeB2ee',
    '#ff00ff',
    '#ff69b4',
    '#ffcOcb',
    '#808080',
    '#cOcOcO',
    '#fSfS15',
    '#f08080',
    '#800000',
    '#fa8072',
    '#ff4500',
    '#d2691e',
    '#cd853f',
    '#deb887',
    '#ffebcd',
    '#fSdeb3',
    '#daa520',
    '#f0e68c',
    '#f5f5dc',
    '#fffF00',
    '#adff2f',
    '#Bfbc8F',
    '#32cd32',
    '#2e8b57',
    '#00fa9a',
    '#20b2aa',
    '#afeeee',
    '#008b8b',
    '#5f9ea0',
    '#87ceeb',
    '#1e90ff',
    '#708090',
    '#f8f8ff',
    '#00008b',
    '#483d8b',
    '#8a2be2',
    '#ba55d3',
    '#800080',
    '#da70d6',
    '#fffOtS',
  ];

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

      // Combine filtered routeFullCoords and spaceFullCoords for drawing
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
   * Draws multiple routes based on the checkedNodes.
   * If all nodes are checked, show all routes.
   * If some nodes are unchecked, only show the checked routes.
   * @param {Object} map - The TomTom map instance
   * @param {Array} routeFullCoords - The array of all route objects with coordinates
   */
  const drawRoutes = (map, routeFullCoords = []) => {
    // Ensure the style is loaded before trying to add layers
    if (!map.isStyleLoaded()) {
      map.on('style.load', () => {
        drawRoutes(map, routeFullCoords); // After the style has loaded, draw the routes
      });
      return;
    }

    if (!routeFullCoords || !Array.isArray(routeFullCoords)) {
      console.error('Invalid routeFullCoords');
      return;
    }

    // Clear any previous routes and markers
    clearRoutesAndMarkers(map);

    const newColors = [];

    // Loop through the routes and draw them
    routeFullCoords.forEach((route, index) => {
      if (!route.coords || route.coords.length === 0) {
        console.error(`Invalid coordinates for route ${index}`);
        return;
      }

      // Extract coordinates from route.coords
      const coordinates = route.coords.map((coord) => [coord.lng, coord.lat]);

      // Add start and end markers with custom icons (Start_Point and End_Point)
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

      // Store markers in the ref array
      routeMarkers.current.push(startMarker, endMarker);

      // Create GeoJSON for the route
      const geoJsonRoute = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      };

      const newRouteLayerId = `route-${index}-${Date.now()}`;
      routeLayerIds.current.push(newRouteLayerId);

      // Select a color from the predefined colors array
      const routeColor = colors[index % colors.length];
      newColors.push(routeColor);

      // Add the polyline route to the map
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

      // Center the map on the route
      const bounds = new tt.LngLatBounds();
      coordinates.forEach((coord) => {
        bounds.extend(coord);
      });

      map.fitBounds(bounds, { padding: 50 });
    });

    if (
      JSON.stringify(newColors) !== JSON.stringify(previousColorsRef.current)
    ) {
      previousColorsRef.current = newColors; // Update the reference
      routeColors(newColors); // Update the parent with new colors
    }
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
