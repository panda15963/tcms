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

function calculateCenterFromCoords(startCoord, goalCoord) {
  const [startLng, startLat] = startCoord.split(',').map(Number);
  const [goalLng, goalLat] = goalCoord.split(',').map(Number);

  const centerLat = (startLat + goalLat) / 2;
  const centerLng = (startLng + goalLng) / 2;

  return { lat: centerLat, lng: centerLng };
}

export default function GoogleMap({
  lat,
  lng,
  locationCoords = () => {}, // Callback function to pass coordinates
  origins = [], // Default to empty array
  destinations = [], // Default to empty array
  error = () => {},
  clickedNode,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const [markers, setMarkers] = useState([initialCoords]);
  const [map, setMap] = useState(null);
  const [directionsRenderers, setDirectionsRenderers] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const { t } = useTranslation();

  // Effect to handle when clickedNode is changed (route selection)
  useEffect(() => {
    if (clickedNode && clickedNode.start_coord && clickedNode.goal_coord) {
      const newCenter = calculateCenterFromCoords(
        clickedNode.start_coord,
        clickedNode.goal_coord,
      );
      const startMarker = calculateCenterAndMarker(
        ...clickedNode.start_coord.split(','),
      );
      const goalMarker = calculateCenterAndMarker(
        ...clickedNode.goal_coord.split(','),
      );

      setCenter(newCenter);
      setMarkers([startMarker, goalMarker]);

      // Zoom out when a route is selected
      if (map) {
        map.setZoom(11);
      }
    }
  }, [clickedNode, map]);

  // Effect to handle lat and lng updates (when a specific point is selected via search)
  useEffect(() => {
    if (
      lat !== undefined &&
      lng !== undefined &&
      (!clickedNode || lat || lng)
    ) {
      const newCenter = calculateCenterAndMarker(lat, lng);
      setCenter(newCenter);
      setMarkers([newCenter]);

      // Zoom in when a specific point is searched
      if (map) {
        map.setZoom(17);
      }
    }
  }, [lat, lng, map]);

  const clearMarkers = () => {
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
  };

  // Initialize the map and other Google Maps components
  useEffect(() => {
    if (!window.google) {
      error(t('GoogleMap.APIError'));
      return;
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: Number(process.env.REACT_APP_ZOOM), // Initial zoom level from env variables
      center: center,
      mapTypeControl: false,
    });

    setMap(mapInstance); // Set the map instance to state

    // Add click listener to map
    mapInstance.addListener('click', (event) => {
      const clickedLat = event.latLng.lat();
      const clickedLng = event.latLng.lng();

      // Call the locationCoords callback with clicked coordinates
      locationCoords({ lat: clickedLat, lng: clickedLng });
    });
  }, []);

  // Center the map and update markers when 'center' state changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center); // Directly re-center the map

      clearMarkers();
      markers.forEach((marker) => {
        const newMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
        });
        markerRefs.current.push(newMarker);
      });
    }
  }, [center, map, markers, clickedNode]);

  // Handle directions (routing) between multiple origins and destinations
  useEffect(() => {
    // Convert origins and destinations to arrays if they are strings
    const originsArray = typeof origins === 'string' ? [origins] : origins;
    const destinationsArray =
      typeof destinations === 'string' ? [destinations] : destinations;

    // Check if originsArray and destinationsArray have elements
    if (
      Array.isArray(originsArray) &&
      Array.isArray(destinationsArray) &&
      originsArray.length &&
      destinationsArray.length &&
      map
    ) {
      // Clear previous directions
      directionsRenderers.forEach((renderer) => renderer.setMap(null));
      setDirectionsRenderers([]);

      // Create a directions renderer for each pair of origin and destination
      originsArray.forEach((origin, index) => {
        const destination = destinationsArray[index];
        const originString = typeof origin === 'string' ? origin : '';
        const destinationString =
          typeof destination === 'string' ? destination : '';

        const [originsLng, originsLat] = originString.split(',').map(Number);
        const [destinationsLng, destinationsLat] = destinationString
          .split(',')
          .map(Number);

        if (
          !isNaN(originsLng) &&
          !isNaN(originsLat) &&
          !isNaN(destinationsLng) &&
          !isNaN(destinationsLat)
        ) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRendererInstance =
            new window.google.maps.DirectionsRenderer();

          directionsService.route(
            {
              origin: new window.google.maps.LatLng(originsLat, originsLng),
              destination: new window.google.maps.LatLng(
                destinationsLat,
                destinationsLng,
              ),
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === 'OK') {
                directionsRendererInstance.setDirections(result);
                directionsRendererInstance.setMap(map);
                setDirectionsRenderers((prevRenderers) => [
                  ...prevRenderers,
                  directionsRendererInstance,
                ]);
                // Optionally adjust zoom level or add other map features here
              } else if (status === 'ZERO_RESULTS') {
                error(t('GoogleMap.RouteZeroResults'));
              } else {
                error(t('GoogleMap.RouteError'));
              }
            },
          );
        }
      });
    }
  }, [origins, destinations, map]);

  // Render the map container
  return <div ref={mapRef} className="map" />;
}
