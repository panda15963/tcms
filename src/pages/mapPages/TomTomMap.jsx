import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { useEffect, useState, useRef } from 'react';
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
  if (coordsArray.length === 2 && !isNaN(coordsArray[0]) && !isNaN(coordsArray[1])) {
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

      // Wait until the style is fully loaded before drawing routes
      mapRef.current.on('style.load', () => {
        if (!place && routeFullCoords) {
          drawRoutes(mapRef.current, routeFullCoords);
        }
      });
    };

    if (!window.tt) {
      loadScript();
    } else {
      initializeMap();
    }
  }, [center, routeFullCoords, place]);

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
   * Draws multiple routes from routeFullCoords on the map and adds start (origin) and finish (destination) markers.
   * @param {Object} map - The TomTom map instance
   * @param {Array} routeFullCoords - The array of route objects with coordinates
   */
  const drawRoutes = (map, routeFullCoords) => {
    console.log('routeFullCoords', routeFullCoords);

    if (!routeFullCoords || !Array.isArray(routeFullCoords)) {
      console.error('Invalid routeFullCoords');
      return;
    }

    // Clear any previous routes
    clearRoutes(map);

    // Loop through each route in routeFullCoords
    routeFullCoords.forEach((route, index) => {
      if (!route.coords || route.coords.length === 0) {
        console.error(`Invalid coordinates for route ${index}`);
        return;
      }

      // Extract coordinates from route.coords
      const coordinates = route.coords.map((coord) => [coord.lng, coord.lat]);

      // Add start and end markers
      const startCoord = coordinates[0];
      const endCoord = coordinates[coordinates.length - 1];

      new tt.Marker({ color: 'green' }).setLngLat(startCoord).addTo(map);
      new tt.Marker({ color: 'red' }).setLngLat(endCoord).addTo(map);

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

      // Add the polyline route to the map
      map.addLayer({
        id: newRouteLayerId,
        type: 'line',
        source: {
          type: 'geojson',
          data: geoJsonRoute,
        },
        paint: {
          'line-color': `hsl(${Math.random() * 360}, 100%, 50%)`, // Random color for each route
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
