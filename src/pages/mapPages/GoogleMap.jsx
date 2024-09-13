import { useEffect, useRef, useState } from 'react';
import '../../style/MapStyle.css';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE);
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE);

  return {
    lat: lat !== undefined ? parseFloat(lat) : defaultLat,
    lng: lng !== undefined ? parseFloat(lng) : defaultLng,
  };
}

export default function GoogleMap({
  lat,
  lng,
  locationCoords = () => {}, // Callback function to pass coordinates
  origins = [],
  destinations = [],
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng);
  const [center, setCenter] = useState(initialCoords);
  const [markers, setMarkers] = useState([initialCoords]);
  const [map, setMap] = useState(null);
  const [directionsRenderers, setDirectionsRenderers] = useState([]);
  const mapRef = useRef(null);
  const markerRefs = useRef([]);

  console.log(origins, destinations);

  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
    setMarkers([newCenter]);
  }, [lat, lng]);

  const clearMarkers = () => {
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
  };

  // Initialize the map and other Google Maps components
  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API is not available.');
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

      // Optionally, log the coordinates or update state
      console.log('Coordinates clicked: ', { lat: clickedLat, lng: clickedLng });
    });
  }, []);

  // Center the map and update markers when 'center' state changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);  // Directly re-center the map
      map.setZoom(17); // Adjust this value as needed

      clearMarkers();
      markers.forEach((marker) => {
        const newMarker = new window.google.maps.Marker({
          position: marker,
          map: map,
        });
        markerRefs.current.push(newMarker);
      });
    }
  }, [center, map, markers]);

  // Handle directions (routing) between multiple origins and destinations
  useEffect(() => {
    if (origins.length && destinations.length && map) {
      // Clear previous directions
      directionsRenderers.forEach(renderer => renderer.setMap(null));
      setDirectionsRenderers([]);

      // Create a directions renderer for each pair of origin and destination
      origins.forEach((origin, index) => {
        const destination = destinations[index];
        const originString = typeof origin === 'string' ? origin : '';
        const destinationString = typeof destination === 'string' ? destination : '';

        const [originsLng, originsLat] = originString.split(',').map(Number);
        const [destinationsLng, destinationsLat] = destinationString.split(',').map(Number);

        if (!isNaN(originsLng) && !isNaN(originsLat) && !isNaN(destinationsLng) && !isNaN(destinationsLat)) {
          const directionsService = new window.google.maps.DirectionsService();
          const directionsRendererInstance = new window.google.maps.DirectionsRenderer();

          directionsService.route(
            {
              origin: new window.google.maps.LatLng(originsLat, originsLng),
              destination: new window.google.maps.LatLng(destinationsLat, destinationsLng),
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === 'OK') {
                directionsRendererInstance.setDirections(result);
                directionsRendererInstance.setMap(map);
                setDirectionsRenderers(prevRenderers => [...prevRenderers, directionsRendererInstance]);

                // Optionally adjust zoom level or add other map features here
              } else if (status === 'ZERO_RESULTS') {
                console.log('No routes found between the two locations.');
              } else {
                console.error('Directions request failed due to ' + status);
              }
            }
          );
        }
      });
    }
  }, [origins, destinations, map]);

  // Render the map container
  return <div ref={mapRef} className="map" />;
}
