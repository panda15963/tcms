import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import End_Point from '../../assets/images/multi_end_point.svg'; // Import your custom End Point icon
import Start_Point from '../../assets/images/multi_start_point.svg'; // Import your custom Start Point icon
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
  routeColors = () => {}, // Callback function to pass route colors
  spaceFullCoords,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const spaceMarkerRefs = useRef([]);
  const spacePolylinesRef = useRef([]);
  const routeMarkerRefs = useRef([]);
  const routePolylinesRef = useRef([]);
  const [previousRouteCoords, setPreviousRouteCoords] = useState([]);
  const [adjustedRouteCoords, setAdjustedRouteCoords] = useState([]);
  const [previousSpaceCoords, setPreviousSpaceCoords] = useState([]);
  const [adjustedSpaceCoords, setAdjustedSpaceCoords] = useState([]);

  const markerRefs = useRef([]); // Store references to markers for cleanup
  const initialMarkerRef = useRef(null);
  const { t } = useTranslation();

  // Memoize the callback functions
  const memoizedLocationCoords = useCallback(locationCoords, []);

  // Clear functions for spaceFullCoords
  const clearSpacePolylines = () => {
    spacePolylinesRef.current.forEach((polyline) => polyline.setMap(null));
    spacePolylinesRef.current = [];
  };

  const clearSpaceMarkers = () => {
    spaceMarkerRefs.current.forEach((marker) => marker.setMap(null));
    spaceMarkerRefs.current = [];
  };

  // Clear functions for routeFullCoords
  const clearRoutePolylines = () => {
    routePolylinesRef.current.forEach((polyline) => polyline.setMap(null));
    routePolylinesRef.current = [];
  };

  const clearRouteMarkers = () => {
    routeMarkerRefs.current.forEach((marker) => marker.setMap(null));
    routeMarkerRefs.current = [];
  };

  const clearMarkers = () => {
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
  };

  useEffect(() => {
    if (!window.google) {
      error(t('GoogleMap.APIError'));
      return;
    }

    if (!map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: Number(process.env.REACT_APP_ZOOM) || 10,
        center: initialCoords,
        mapTypeControl: true,
      });

      setMap(mapInstance);

      // 기본 마커 추가
      const initialMarker = new window.google.maps.Marker({
        position: initialCoords,
        map: mapInstance,
      });
      initialMarkerRef.current = initialMarker; // Store the reference to the initial marker
      markerRefs.current.push(initialMarker);

      mapInstance.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        memoizedLocationCoords({ lat: clickedLat, lng: clickedLng });
      });
    }
  }, [map, initialCoords, t, error, memoizedLocationCoords]);

  // Update center and zoom when lat/lng updates
  useEffect(() => {
    if (map) {
      const newCenter = calculateCenterAndMarker(lat, lng);
      if (
        newCenter.lat !== map.getCenter().lat() ||
        newCenter.lng !== map.getCenter().lng()
      ) {
        map.setCenter(newCenter);
      }
      clearMarkers();
      const marker = new window.google.maps.Marker({
        position: newCenter,
        map: map,
      });
      markerRefs.current.push(marker);
    }
  }, [lat, lng, map]);

  const findRemovedSpaceIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id,
      );
      if (isRouteRemoved) {
        return i; // Index of the removed route
      }
    }
    return -1; // No route was removed
  };

  useEffect(() => {
    if (
      previousSpaceCoords.length > 0 &&
      previousSpaceCoords.length > spaceFullCoords.length
    ) {
      const removedIndex = findRemovedSpaceIndex(
        previousSpaceCoords,
        spaceFullCoords,
      );
      if (removedIndex !== -1) {
        // Create a new array with null at the removed index
        const newAdjustedCoords = [...previousSpaceCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedSpaceCoords(newAdjustedCoords);
      }
    } else {
      // If no routes have been removed, just update the adjustedSpaceCoords to match spaceFullCoords
      setAdjustedSpaceCoords(spaceFullCoords);
    }

    // Update previousSpaceCoords state
    setPreviousSpaceCoords(spaceFullCoords);
  }, [spaceFullCoords]);

  // Draw spaceFullCoords on the map
  useEffect(() => {
    if (!map) return;

    // Clear previous space polylines and markers
    clearSpacePolylines();
    clearSpaceMarkers();

    const spaceCoords = [];
    const spaceMarkers = [];

    adjustedSpaceCoords.forEach((space, index) => {
      if (space && space.coords && space.coords.length > 0) {
        // Check if space is not null before accessing its properties
        spaceCoords.push(...space.coords);

        const startMarker = calculateCenterAndMarker(
          space.coords[0].lat,
          space.coords[0].lng,
        );
        const goalMarker = calculateCenterAndMarker(
          space.coords[space.coords.length - 1].lat,
          space.coords[space.coords.length - 1].lng,
        );

        spaceMarkers.push(startMarker, goalMarker);

        const polylinePath = space.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        // Use the color from routeColors based on the current index
        const polylineColor = routeColors[index % routeColors.length];

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: polylineColor,
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });

        polyline.setMap(map);
        spacePolylinesRef.current.push(polyline); // Add polyline reference
      }
    });

    if (spaceCoords.length > 0) {
      spaceMarkers.forEach((marker, index) => {
        const spaceMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
          icon: index % 2 === 0 ? Start_Point : End_Point,
        });
        spaceMarkerRefs.current.push(spaceMarker); // Add marker reference
      });

      const bounds = calculateBounds(spaceCoords);
      map.fitBounds(bounds);
    }
  }, [adjustedSpaceCoords, map, routeColors]);

  const findRemovedRouteIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id,
      );
      if (isRouteRemoved) {
        return i; // Index of the removed route
      }
    }
    return -1; // No route was removed
  };

  // Effect to detect when a route is removed and update adjustedRouteCoords
  useEffect(() => {
    if (
      previousRouteCoords.length > 0 &&
      previousRouteCoords.length > routeFullCoords.length
    ) {
      const removedIndex = findRemovedRouteIndex(
        previousRouteCoords,
        routeFullCoords,
      );
      if (removedIndex !== -1) {
        // Create a new array with null at the removed index
        const newAdjustedCoords = [...previousRouteCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedRouteCoords(newAdjustedCoords);
      }
    } else {
      // If no routes have been removed, just update the adjustedRouteCoords to match routeFullCoords
      setAdjustedRouteCoords(routeFullCoords);
    }

    // Update previousRouteCoords state
    setPreviousRouteCoords(routeFullCoords);
  }, [routeFullCoords]);

  useEffect(() => {
    console.log('Adjusted Route Coords:', adjustedRouteCoords);
  }, [adjustedRouteCoords]);

  // Draw routeFullCoords on the map
  useEffect(() => {
    if (!map) {
      console.warn('Map instance is not initialized');
      return;
    }

    if (!routeFullCoords || routeFullCoords.length === 0) {
      console.warn('No routeFullCoords available');
      return;
    }

    // Clear previous route polylines and markers
    clearRoutePolylines();
    clearRouteMarkers();

    const routeCoords = [];
    const routeMarkers = [];

    adjustedRouteCoords.forEach((route, index) => {
      if (route && route.coords && route.coords.length > 0) {
        // Check if route is not null before accessing its properties
        routeCoords.push(...route.coords);

        const startMarker = calculateCenterAndMarker(
          route.coords[0].lat,
          route.coords[0].lng,
        );
        const goalMarker = calculateCenterAndMarker(
          route.coords[route.coords.length - 1].lat,
          route.coords[route.coords.length - 1].lng,
        );

        routeMarkers.push(startMarker, goalMarker);

        const polylinePath = route.coords.map((coord) => ({
          lat: coord.lat,
          lng: coord.lng,
        }));

        // Use the color from routeColors based on the current index
        const polylineColor = routeColors[index % routeColors.length];

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: polylineColor,
          strokeOpacity: 0.8,
          strokeWeight: 5,
        });

        polyline.setMap(map);
        routePolylinesRef.current.push(polyline); // Add polyline reference
      }
    });

    if (routeCoords.length > 0) {
      routeMarkers.forEach((marker, index) => {
        const routeMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
          icon: index % 2 === 0 ? Start_Point : End_Point,
        });
        routeMarkerRefs.current.push(routeMarker); // Add marker reference
      });

      const bounds = calculateBounds(routeCoords);
      map.fitBounds(bounds);
    }
  }, [adjustedRouteCoords, map, routeColors]);

  // Center map on clickedNode when it changes
  useEffect(() => {
    if (
      !map ||
      !clickedNode ||
      !clickedNode.start_coord ||
      !clickedNode.goal_coord
    )
      return;

    const startCoord = clickedNode.start_coord.split(',').map(Number);
    const goalCoord = clickedNode.goal_coord.split(',').map(Number);
    const routeCoords = [
      { lat: startCoord[1], lng: startCoord[0] },
      { lat: goalCoord[1], lng: goalCoord[0] },
    ];

    const bounds = calculateBounds(routeCoords);
    map.fitBounds(bounds);
  }, [clickedNode, map]);

  return <div ref={mapRef} style={{ height: "87.8vh"}} />;
}
