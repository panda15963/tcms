import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../style/MapStyle.css';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

  return {
    lat: lat !== undefined ? parseFloat(lat) : defaultLat,
    lng: lng !== undefined ? parseFloat(lng) : defaultLng,
  };
}

function calculateBounds(coordsArray) {
  const bounds = new window.google.maps.LatLngBounds();
  coordsArray.forEach((coord) => {
    bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
  });
  return bounds;
}

export default function GoogleMap({
  lat,
  lng,
  locationCoords = () => {}, // Callback function to pass coordinates
  routeFullCoords, // Contains coords for polyline
  clickedNode, // Selected route to center the map on
  error = () => {},
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef([]); // Store references to markers for cleanup
  const polylinesRef = useRef([]); // Store references to multiple polylines
  const { t } = useTranslation();
  
  const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080']; // Define different colors

  // Clear all existing markers
  const clearMarkers = () => {
    markerRefs.current.forEach((marker) => marker.setMap(null)); // Remove all markers from map
    markerRefs.current = []; // Clear marker references
  };

  // Clear all existing polylines
  const clearPolylines = () => {
    polylinesRef.current.forEach((polyline) => polyline.setMap(null)); // Remove all polylines from map
    polylinesRef.current = []; // Clear polyline references
  };

  // Initialize the map once when the component is mounted
  useEffect(() => {
    if (!window.google) {
      error(t('GoogleMap.APIError'));
      return;
    }

    // Ensure the map is initialized only once
    if (!map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: Number(process.env.REACT_APP_ZOOM) || 10,
        center: initialCoords,
        mapTypeControl: false,
      });

      setMap(mapInstance);

      // Add map click listener
      mapInstance.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        locationCoords({ lat: clickedLat, lng: clickedLng });
      });
    }
  }, [map, initialCoords, t, error, locationCoords]);

  // Update center and zoom when lat/lng updates, and ensure a marker is placed
  useEffect(() => {
    if (map) {
      const newCenter = calculateCenterAndMarker(lat, lng);

      // Check if the center has changed
      if (
        newCenter.lat !== map.getCenter().lat() ||
        newCenter.lng !== map.getCenter().lng()
      ) {
        // Clear existing markers and polylines, then add a marker for the new center
        clearMarkers(); // Clear all previous markers
        clearPolylines(); // Clear all previous polylines

        map.setCenter(newCenter); // Set the new center
        map.setZoom(17); // Zoom in for specific point

        // Add a new marker at the center
        const marker = new window.google.maps.Marker({
          position: newCenter,
          map: map,
        });
        markerRefs.current.push(marker); // Store marker reference for cleanup
      }
    }
  }, [lat, lng, map]);

  // Draw polylines and fit bounds when routeFullCoords changes
  useEffect(() => {
    if (!map || !routeFullCoords || routeFullCoords.length === 0) return;

    clearPolylines(); // Clear previous polylines

    const allCoords = [];
    const newMarkers = [];

    routeFullCoords.forEach((route, index) => {
      if (route.coords && route.coords.length > 0) {
        allCoords.push(...route.coords);

        const startMarker = calculateCenterAndMarker(
          route.coords[0].lat,
          route.coords[0].lng,
        );
        const goalMarker = calculateCenterAndMarker(
          route.coords[route.coords.length - 1].lat,
          route.coords[route.coords.length - 1].lng,
        );

        newMarkers.push(startMarker, goalMarker);

        const polylinePath = route.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        const routeColor = colors[index % colors.length]; // Assign different color for each route

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: routeColor, // Set color for each route
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });

        polyline.setMap(map); // Draw polyline on map
        polylinesRef.current.push(polyline); // Store reference to polyline
      }
    });

    // Update markers and fit bounds only if coordinates have changed
    if (allCoords.length > 0) {
      clearMarkers(); // Clear old markers
      newMarkers.forEach((marker) => {
        const newMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
        });
        markerRefs.current.push(newMarker); // Store reference to marker
      });

      const bounds = calculateBounds(allCoords);
      map.fitBounds(bounds); // Fit the map to the route bounds
    }
  }, [routeFullCoords, map]);

  // Center map on selected route when clickedNode changes
  useEffect(() => {
    if (
      !map ||
      !clickedNode ||
      !clickedNode.start_coord ||
      !clickedNode.goal_coord
    )
      return;

    // Split and convert string coordinates to numbers
    const startCoord = clickedNode.start_coord.split(',').map(Number);
    const goalCoord = clickedNode.goal_coord.split(',').map(Number);

    const routeCoords = [
      { lat: startCoord[1], lng: startCoord[0] },
      { lat: goalCoord[1], lng: goalCoord[0] },
    ];

    const bounds = calculateBounds(routeCoords);

    // Ensure the map is set to the selected route's bounds
    if (bounds) {
      map.fitBounds(bounds); // Fit the map to the selected route bounds
    }
  }, [clickedNode, map]);

  return <div ref={mapRef} className="map" />;
}
