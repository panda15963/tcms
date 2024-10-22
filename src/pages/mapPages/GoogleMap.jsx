import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import End_Point from '../../img/Multi End Point.svg'; // Import your custom End Point icon
import Start_Point from '../../img/Multi Start Point.svg'; // Import your custom Start Point icon
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
  const [routeColorsState, setRouteColorsState] = useState([]);
  const mapRef = useRef(null);
  const spaceMarkerRefs = useRef([]);
  const spacePolylinesRef = useRef([]);
  const routeMarkerRefs = useRef([]);
  const routePolylinesRef = useRef([]);

  const markerRefs = useRef([]); // Store references to markers for cleanup
  const initialMarkerRef = useRef(null);
  const { t } = useTranslation();

  console.log('spaceFullCoords', spaceFullCoords);
  console.log('routeFullCoords', routeFullCoords);

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

  // Memoize the callback functions
  const memoizedLocationCoords = useCallback(locationCoords, []);
  const memoizedRouteColors = useCallback(routeColors, []);

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

  // Draw spaceFullCoords on the map
  useEffect(() => {
    if (!map) return;

    // Clear previous space polylines and markers
    clearSpacePolylines();
    clearSpaceMarkers();

    const spaceCoords = [];
    const spaceMarkers = [];
    const generatedColors = [];

    spaceFullCoords.forEach((space, index) => {
      if (space.coords && space.coords.length > 0) {
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

        const spaceColor = colors[index % colors.length];
        generatedColors.push(spaceColor);

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: spaceColor,
          strokeOpacity: 0.8,
          strokeWeight: 3,
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

    if (
      generatedColors.length > 0 &&
      JSON.stringify(routeColorsState) !== JSON.stringify(generatedColors)
    ) {
      setRouteColorsState(generatedColors);
      memoizedRouteColors(generatedColors);
    }
  }, [spaceFullCoords, map, memoizedRouteColors]);

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
    const generatedColors = [];

    routeFullCoords.forEach((route, index) => {
      if (route.coords && route.coords.length > 0) {
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

        const spaceColor = colors[index % colors.length];
        generatedColors.push(spaceColor);

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: spaceColor,
          strokeOpacity: 0.8,
          strokeWeight: 3,
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

    if (
      generatedColors.length > 0 &&
      JSON.stringify(routeColorsState) !== JSON.stringify(generatedColors)
    ) {
      setRouteColorsState(generatedColors);
      memoizedRouteColors(generatedColors);
    }
  }, [routeFullCoords, map, memoizedRouteColors]);

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

  return <div ref={mapRef} className="map" />;
}
