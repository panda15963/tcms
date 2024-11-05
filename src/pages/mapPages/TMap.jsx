import React, { useEffect, useState, useRef } from 'react';
import End_Point from '../../img/Multi End Point.svg'; // Import your custom End Point icon
import Start_Point from '../../img/Multi Start Point.svg'; // Import your custom Start Point icon
import '../../style/MapStyle.css'; // Ensure this CSS file exists

// Function to parse the coordinates string
function parseCoordinates(coordString) {
  const [lng, lat] = coordString.split(',').map(Number); // Split and convert to numbers
  return { lat, lng };
}

// Function to handle both single and multiple coordinates
function handleCoordinateInput(input) {
  if (Array.isArray(input)) {
    return input
      .map((coord) => {
        if (typeof coord === 'object' && 'lat' in coord && 'lng' in coord) {
          return coord; // Assume it's a valid object with lat and lng
        } else if (typeof coord === 'string') {
          return parseCoordinates(coord);
        } else {
          console.log('Invalid coordinate format:', coord);
          return coord;
        }
      })
      .filter((coord) => coord !== null); // Filter out invalid coordinates
  } else {
    console.error('Expected an array of coordinates or strings:', input);
    return [];
  }
}

/**
 * TMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE); // 기본 위도 값
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE); // 기본 경도 값

  const parsedLat = parseFloat(lat); // Convert lat to a number
  const parsedLng = parseFloat(lng); // Convert lng to a number

  return {
    lat: !isNaN(parsedLat) ? parsedLat : defaultLat,
    lng: !isNaN(parsedLng) ? parsedLng : defaultLng,
  };
}

/**
 * TMap 컴포넌트
 * @param {number|string} lat - 위도 값
 * @param {number|string} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function TMap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords, // List of routes with coordinates
  spaceFullCoords,
  checkedNodes, // List of checked nodes
  clickedNode, // Node that is clicked
  searchedLocation, // Searched location to center on
  routeColors = [], // Array of route colors
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // Initial map center calculation
  const [center, setCenter] = useState(initialCoords); // Manage map center state

  const mapRef = useRef(null); // Reference for map instance
  const markerRef = useRef(null); // Reference for center marker
  const zoomSetRef = useRef(false); // Track if zoom has been set

  const startMarkerRef = useRef([]); // Multiple start markers
  const finishMarkerRef = useRef([]); // Multiple finish markers
  const polylineRef = useRef([]); // To store polylines
  const spaceMarkerRef = useRef([]); // Reference for space markers

  // Update the center of the map when lat and lng props change
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  // Load TMap script and initialize the map
  useEffect(() => {
    if (!window.Tmapv2) {
      const scriptUrl = `https://api2.sktelecom.com/tmap/djs?version=1&appKey=${process.env.REACT_APP_TMAP_API}`;

      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => {
        initMap();
      };
      script.onerror = () => {
        console.error('Failed to load Tmap script from URL:', scriptUrl);
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Update the center and marker on the map when `center` changes
  useEffect(() => {
    if (mapRef.current) {
      updateMapCenter();
    }
  }, [center]);

  // Update map center when a new location is searched
  useEffect(() => {
    if (searchedLocation && mapRef.current) {
      const { lat: searchedLat, lng: searchedLng } = searchedLocation;
      const newCenter = new window.Tmapv2.LatLng(searchedLat, searchedLng);
      mapRef.current.setCenter(newCenter); // Center map on the searched location
      mapRef.current.setZoom(10); // Optionally zoom in on the searched location
    }
  }, [searchedLocation]);

  // Update map when a route node is clicked
  useEffect(() => {
    if (clickedNode && mapRef.current) {
      const { start_coord, goal_coord } = clickedNode;

      if (start_coord && goal_coord) {
        const { lat: startLat, lng: startLng } = parseCoordinates(start_coord);
        const startLocation = new window.Tmapv2.LatLng(startLat, startLng);
        mapRef.current.setCenter(startLocation); // Center map on the start location
        mapRef.current.setZoom(10); // Optionally zoom in when a route is clicked
        console.log('Clicked node centered:', clickedNode);
      }
    }
  }, [clickedNode]);

  // Add a ref to store the previous colors
  const previousColorsRef = useRef([]);

  useEffect(() => {
    async function fetchRoutesAndUpdateMap() {
      const { Tmapv2 } = window;

      const newColors = []; // Array to store the new route colors

      // Clear previous markers and routes
      if (startMarkerRef.current.length) {
        startMarkerRef.current.forEach((marker) => marker.setMap(null));
        startMarkerRef.current = [];
      }
      if (finishMarkerRef.current.length) {
        finishMarkerRef.current.forEach((marker) => marker.setMap(null));
        finishMarkerRef.current = [];
      }
      if (polylineRef.current.length) {
        polylineRef.current.forEach((polyline) => polyline.setMap(null));
        polylineRef.current = [];
      }

      if (routeFullCoords && Array.isArray(routeFullCoords)) {
        // Clear existing markers and polylines first
        startMarkerRef.current.forEach((marker) => marker.setMap(null));
        finishMarkerRef.current.forEach((marker) => marker.setMap(null));
        polylineRef.current.forEach((polyline) => polyline.setMap(null));

        // Reset marker and polyline arrays
        startMarkerRef.current = [];
        finishMarkerRef.current = [];
        polylineRef.current = [];
        // Assuming routeColors is passed as an array of colors
        routeFullCoords.forEach((route, index) => {
          const nodeChecked = checkedNodes.some(
            (node) => node.file_id === route.file_id,
          ); // Check if the route is in checkedNodes
          if (!nodeChecked) return; // Skip if node is unchecked

          const coords = route.coords; // Extract coords for the route
          const parsedCoords = handleCoordinateInput(coords); // Parse coordinates

          if (parsedCoords.length === 0) {
            console.warn('No valid coordinates for route');
            return;
          }

          // Start and Finish markers
          const startCoord = parsedCoords[0]; // First coordinate
          const finishCoord = parsedCoords[parsedCoords.length - 1]; // Last coordinate

          // Add start marker
          const startMarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(startCoord.lat, startCoord.lng),
            map: mapRef.current,
            icon: Start_Point, // Use custom Start_Point icon
            iconSize: new Tmapv2.Size(32, 32),
          });
          startMarkerRef.current.push(startMarker);

          // Add finish marker
          const finishMarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(finishCoord.lat, finishCoord.lng),
            map: mapRef.current,
            icon: End_Point, // Use custom End_Point icon
            iconSize: new Tmapv2.Size(32, 32),
          });
          finishMarkerRef.current.push(finishMarker);

          // Select a color for the polyline from the routeColors array
          const color = routeColors[index % routeColors.length] || '#ff0000'; // Default color if no color available
          newColors.push(color); // Store the color for this route

          // Create polyline for the route
          const polylinePath = parsedCoords.map(
            (coord) => new Tmapv2.LatLng(coord.lat, coord.lng),
          );
          const polyline = new Tmapv2.Polyline({
            path: polylinePath,
            strokeColor: color, // Apply the selected color
            strokeWeight: 5,
            map: mapRef.current, // Add this to display the polyline on the map
          });
          polylineRef.current.push(polyline);

          // Optionally center map on the route
          let latSum = 0;
          let lngSum = 0;
          let pointCount = 0;

          parsedCoords.forEach(({ lat, lng }) => {
            latSum += lat;
            lngSum += lng;
            pointCount++;
          });

          if (pointCount > 0) {
            const avgLat = latSum / pointCount;
            const avgLng = lngSum / pointCount;
            const centerCoords = new Tmapv2.LatLng(avgLat, avgLng);
            mapRef.current.setCenter(centerCoords);

            if (!zoomSetRef.current) {
              mapRef.current.setZoom(7); // Set zoom once
              zoomSetRef.current = true;
            }
          }
        });

        // Compare newColors with previousColorsRef
        if (
          JSON.stringify(newColors) !==
          JSON.stringify(previousColorsRef.current)
        ) {
          previousColorsRef.current = newColors; // Update the reference
        }
      } else {
        console.warn('routeFullCoords is null or not an array');
      }
    }

    if (routeFullCoords) {
      fetchRoutesAndUpdateMap();
    }
  }, [routeFullCoords, checkedNodes]);

  // Update the map with space markers and polylines
  useEffect(() => {
    async function fetchSpacesAndUpdateMap() {
      const { Tmapv2 } = window;

      const newColors = []; // Array to store the new route colors

      // Clear previous space markers and polylines
      if (spaceMarkerRef.current.length) {
        spaceMarkerRef.current.forEach((marker) => marker.setMap(null));
        spaceMarkerRef.current = [];
      }
      if (polylineRef.current.length) {
        polylineRef.current.forEach((polyline) => polyline.setMap(null));
        polylineRef.current = [];
      }

      if (spaceFullCoords && Array.isArray(spaceFullCoords)) {
        console.log(spaceFullCoords);
        // Parse and add start, finish markers, and polylines for each space
        spaceFullCoords.forEach((space, index) => {
          const spaceChecked = checkedNodes.some(
            (node) => node.file_id === space.file_id,
          ); // Check if the space is in checkedNodes
          if (!spaceChecked) return; // Skip if the space is unchecked

          const parsedCoords = handleCoordinateInput(space.coords); // Parse coordinates
          if (parsedCoords.length === 0) {
            console.warn('No valid coordinates for space');
            return;
          }

          // Get the start and finish coordinates
          const startCoord = parsedCoords[0]; // First coordinate
          const finishCoord = parsedCoords[parsedCoords.length - 1]; // Last coordinate

          // Add the start marker using the custom Start_Point icon
          const startMarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(startCoord.lat, startCoord.lng),
            map: mapRef.current,
            icon: Start_Point, // Use custom Start_Point icon
            iconSize: new Tmapv2.Size(32, 32),
          });
          spaceMarkerRef.current.push(startMarker);

          // Add the finish marker using the custom End_Point icon
          const finishMarker = new Tmapv2.Marker({
            position: new Tmapv2.LatLng(finishCoord.lat, finishCoord.lng),
            map: mapRef.current,
            icon: End_Point, // Use custom End_Point icon
            iconSize: new Tmapv2.Size(32, 32),
          });
          spaceMarkerRef.current.push(finishMarker);

          // Select a color for the polyline from the routeColors array
          const color = routeColors[index % routeColors.length] || '#0000ff'; // Default color if no color is available
          newColors.push(color); // Store the color for this route

          // Draw the polyline for the route
          const polylinePath = parsedCoords.map(
            (coord) => new Tmapv2.LatLng(coord.lat, coord.lng),
          );
          const polyline = new Tmapv2.Polyline({
            path: polylinePath,
            strokeColor: color, // Apply the selected color
            strokeWeight: 4,
            map: mapRef.current, // Add the polyline to the map
          });
          polylineRef.current.push(polyline);
        });

        // Optionally center the map based on the average coordinates of all start and finish markers
        let latSum = 0;
        let lngSum = 0;
        let pointCount = 0;

        spaceFullCoords.forEach((space) => {
          space.coords.forEach(({ lat, lng }) => {
            latSum += lat;
            lngSum += lng;
            pointCount++;
          });
        });

        if (pointCount > 0) {
          const avgLat = latSum / pointCount;
          const avgLng = lngSum / pointCount;
          const centerCoords = new Tmapv2.LatLng(avgLat, avgLng);
          mapRef.current.setCenter(centerCoords);

          if (!zoomSetRef.current) {
            mapRef.current.setZoom(10); // Set zoom once
            zoomSetRef.current = true;
          }
        }
        // Compare newColors with previousColorsRef
        if (
          JSON.stringify(newColors) !==
          JSON.stringify(previousColorsRef.current)
        ) {
          previousColorsRef.current = newColors; // Update the reference
        }
      } else {
        console.warn('spaceFullCoords is null or not an array');
      }
    }

    if (spaceFullCoords) {
      fetchSpacesAndUpdateMap();
    }
  }, [spaceFullCoords, checkedNodes]);

  // Function to update the map center and marker
  function updateMapCenter() {
    const { Tmapv2 } = window;
    if (mapRef.current && Tmapv2) {
      mapRef.current.setCenter(new Tmapv2.LatLng(center.lat, center.lng));

      if (markerRef.current) {
        markerRef.current.setMap(null); // Remove previous marker
      }

      // Add a new marker at the current center
      markerRef.current = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(center.lat, center.lng),
        map: mapRef.current,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: new Tmapv2.Size(32, 32),
      });
    }
  }

  // Initialize the map
  function initMap() {
    if (mapRef.current) {
      updateMapCenter(); // Update the map if it's already initialized
      return; // Exit if already initialized
    }

    const { Tmapv2 } = window;
    mapRef.current = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(center.lat, center.lng),
      zoom: Number(process.env.REACT_APP_ZOOM),
    });

    // Add a click event listener to the map
    mapRef.current.addListener('click', (evt) => {
      const clickedLat = evt.latLng.lat();
      const clickedLng = evt.latLng.lng();
      locationCoords({ lat: clickedLat, lng: clickedLng });
    });

    updateMapCenter(); // Set initial center marker
  }

  return <div id="map_div" className="map" style={{ height: '87.8vh' }} />;
}
