import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css';
import ttServices from '@tomtom-international/web-sdk-services';

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
 * TomTomMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
const processCoordinates = (coords) => {
  if (Array.isArray(coords)) {
    return coords.map((coord) => parseCoordinateString(coord)).filter(Boolean);
  }
  if (typeof coords === 'string') {
    return parseCoordinateString(coords);
  }
  if (
    coords &&
    typeof coords === 'object' &&
    'lat' in coords &&
    'lng' in coords
  ) {
    return { lat: coords.lat, lng: coords.lng };
  }
  return null;
};

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
  origins,
  destinations,
  place,
  checkedNodes,
  clickedNode, // Use this to center the map on a clicked route
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeLayerIds = useRef([]); // Store the route layer IDs to manage multiple routes

  // Update center coordinates whenever lat or lng changes
  useEffect(() => {
    setCenter(calculateCenterAndMarker(lat, lng));
  }, [lat, lng]);

  console.log('checkedNodes ==>', checkedNodes);

  // TomTom API load and map initialization
  useEffect(() => {
    const loadScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.14.0/maps/maps-web.min.js';
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    };

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

      if (!place && origins && destinations) {
        drawRoutes(mapRef.current, origins, destinations);
      }
    };

    if (!window.tt) {
      loadScript();
    } else {
      initializeMap();
    }
  }, [center, origins, destinations, place]);

  // Clear previous routes function
  const clearRoutes = (map) => {
    if (routeLayerIds.current.length > 0) {
      routeLayerIds.current.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
          map.removeSource(layerId);
        }
      });
      routeLayerIds.current = [];
    }
  };

  // Handle searched place and move map
  useEffect(() => {
    if (place && place.lat && place.lng && mapRef.current) {
      moveToPlace(place);
    }
  }, [place]);

  /**
   * Moves the map to a new place and resets the routes.
   * @param {Object} place - The coordinates of the new place to move the map to.
   */
  const moveToPlace = (place) => {
    if (place && place.lat && place.lng) {
      // Clear previous routes
      clearRoutes(mapRef.current); // Clear routes when moving to a new place

      // Move the map center to the new place
      mapRef.current.setCenter([place.lng, place.lat]);

      // Move the marker to the new place
      markerRef.current.setLngLat([place.lng, place.lat]);
    }
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

  /**
   * Draws multiple routes on the map and adds start (origin) and finish (destination) markers.
   * @param {Object} map - The TomTom map instance
   * @param {Array|string|Object} origins - Origin coordinates
   * @param {Array|string|Object} destinations - Destination coordinates
   */
  const drawRoutes = (map, origins, destinations) => {
    let processedOrigins = processCoordinates(origins);
    let processedDestinations = processCoordinates(destinations);

    processedOrigins = Array.isArray(processedOrigins)
      ? processedOrigins
      : [processedOrigins];
    processedDestinations = Array.isArray(processedDestinations)
      ? processedDestinations
      : [processedDestinations];

    if (
      !processedOrigins ||
      !processedDestinations ||
      processedOrigins.length !== processedDestinations.length
    ) {
      console.error('Invalid origin or destination coordinates');
      return;
    }

    // Clear any previous routes
    clearRoutes(map);

    processedOrigins.forEach((originCoords, index) => {
      const destinationCoords = processedDestinations[index];

      if (
        !originCoords ||
        !originCoords.lng ||
        !originCoords.lat ||
        !destinationCoords ||
        !destinationCoords.lng ||
        !destinationCoords.lat
      ) {
        console.error(
          'Missing or invalid lng/lat in origin or destination coordinates',
        );
        return;
      }

      new tt.Marker({ color: 'green' })
        .setLngLat([originCoords.lng, originCoords.lat])
        .addTo(map);

      new tt.Marker({ color: 'red' })
        .setLngLat([destinationCoords.lng, destinationCoords.lat])
        .addTo(map);

      // Calculate the route for each origin-destination pair
      ttServices.services
        .calculateRoute({
          key: process.env.REACT_APP_TOMTOM_MAP_API,
          locations: `${originCoords.lng},${originCoords.lat}:${destinationCoords.lng},${destinationCoords.lat}`,
        })
        .then(function (routeData) {
          const geoJsonRoute = routeData.toGeoJson();
          const newRouteLayerId = `route-${index}-${Date.now()}`;
          routeLayerIds.current.push(newRouteLayerId);

          // Add the route to the map
          map.addLayer({
            id: newRouteLayerId,
            type: 'line',
            source: {
              type: 'geojson',
              data: geoJsonRoute,
            },
            paint: {
              'line-color': `hsl(${Math.random() * 360}, 100%, 50%)`,
              'line-width': 6,
            },
          });

          // Call the centerRoute function to fit the map to the route
          centerRoute(map, originCoords, destinationCoords);
        })
        .catch((error) => {
          console.error('Error calculating route:', error);
        });
    });
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
