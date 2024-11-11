import React, { useEffect, useRef, useState } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg';
import Start_Point from '../../assets/images/multi_start_point.svg';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE) || 0;
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE) || 0;
  return lat && lng
    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
    : { lat: defaultLat, lng: defaultLng };
}

const HereMap = ({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords,
  routeColors,
  clickedNode,
  spaceFullCoords,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const platformInstance = useRef(null);
  const markerRef = useRef(null);
  const polylineRefs = useRef({ routes: [], spaces: [] });
  const markerRefs = useRef({ routes: [], spaces: [] });
  const [previousRouteCoords, setPreviousRouteCoords] = useState([]);
  const [adjustedRouteCoords, setAdjustedRouteCoords] = useState([]);
  const [previousSpaceCoords, setPreviousSpaceCoords] = useState([]);
  const [adjustedSpaceCoords, setAdjustedSpaceCoords] = useState([]);
  const apiKey = process.env.REACT_APP_HERE_MAP_API;

  const centerMapOnLatLng = (latitude, longitude) => {
    if (mapInstance.current && latitude && longitude) {
      if (markerRef.current) {
        mapInstance.current.removeObject(markerRef.current);
      }
      mapInstance.current.setCenter({ lat: latitude, lng: longitude });
      const searchMarker = new H.map.Marker({ lat: latitude, lng: longitude });
      mapInstance.current.addObject(searchMarker);
      markerRef.current = searchMarker;
    }
  };

  // lat과 lng가 변경될 때마다 호출
  useEffect(() => {
    if (lat && lng) {
      centerMapOnLatLng(lat, lng);
    }
  }, [lat, lng]);

  const findRemovedIndex = (prevCoords, currentCoords) => {
    for (let i = 0; i < prevCoords.length; i++) {
      const prevRoute = prevCoords[i];
      const isRouteRemoved = !currentCoords.some(
        (route) => route.file_id === prevRoute.file_id
      );
      if (isRouteRemoved) {
        return i;
      }
    }
    return -1;
  };

  useEffect(() => {
    if (
      previousRouteCoords.length > 0 &&
      previousRouteCoords.length > routeFullCoords.length
    ) {
      const removedIndex = findRemovedIndex(
        previousRouteCoords,
        routeFullCoords
      );
      if (removedIndex !== -1) {
        const newAdjustedCoords = [...previousRouteCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedRouteCoords(newAdjustedCoords);
      }
    } else {
      setAdjustedRouteCoords(routeFullCoords);
    }
    setPreviousRouteCoords(routeFullCoords);
  }, [routeFullCoords]);

  useEffect(() => {
    if (clickedNode && mapInstance.current) {
      const {
        bb_bottomleft_lat,
        bb_bottomleft_lng,
        bb_topright_lat,
        bb_topright_lng,
      } = clickedNode;
      const bounds = new H.geo.Rect(
        bb_bottomleft_lat,
        bb_bottomleft_lng,
        bb_topright_lat,
        bb_topright_lng
      );
      mapInstance.current.getViewModel().setLookAtData({ bounds });
    }
  }, [clickedNode]);

  useEffect(() => {
    if (
      previousSpaceCoords.length > 0 &&
      previousSpaceCoords.length > spaceFullCoords.length
    ) {
      const removedIndex = findRemovedIndex(
        previousSpaceCoords,
        spaceFullCoords
      );
      if (removedIndex !== -1) {
        const newAdjustedSpaceCoords = [...previousSpaceCoords];
        newAdjustedSpaceCoords[removedIndex] = null;
        setAdjustedSpaceCoords(newAdjustedSpaceCoords);
      }
    } else {
      setAdjustedSpaceCoords(spaceFullCoords);
    }
    setPreviousSpaceCoords(spaceFullCoords);
  }, [spaceFullCoords]);

  const updateAdjustedCoords = (
    previousCoords,
    currentCoords,
    setAdjustedCoords,
    setPreviousCoords
  ) => {
    if (
      previousCoords.length > 0 &&
      previousCoords.length > currentCoords.length
    ) {
      const removedIndex = findRemovedIndex(previousCoords, currentCoords);
      if (removedIndex !== -1) {
        const newAdjustedCoords = [...previousCoords];
        newAdjustedCoords[removedIndex] = null;
        setAdjustedCoords(newAdjustedCoords);
      }
    } else {
      setAdjustedCoords(currentCoords);
    }
    setPreviousCoords(currentCoords);
  };

  useEffect(() => {
    updateAdjustedCoords(
      previousRouteCoords,
      routeFullCoords,
      setAdjustedRouteCoords,
      setPreviousRouteCoords
    );
  }, [routeFullCoords]);

  useEffect(() => {
    updateAdjustedCoords(
      previousSpaceCoords,
      spaceFullCoords,
      setAdjustedSpaceCoords,
      setPreviousSpaceCoords
    );
  }, [spaceFullCoords]);

  const fitMapToEntities = (coords) => {
    if (!coords || coords.length === 0 || !mapInstance.current) return;
  
    let bounds = null;
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;
  
    coords.forEach((coord) => {
      if (coord && Array.isArray(coord.coords)) {
        coord.coords.forEach((point) => {
          if (point && typeof point.lat === 'number' && typeof point.lng === 'number') {
            totalLat += point.lat;
            totalLng += point.lng;
            pointCount += 1;
  
            if (!bounds) {
              bounds = new H.geo.Rect(point.lat, point.lng, point.lat, point.lng);
            } else {
              bounds.mergePoint({ lat: point.lat, lng: point.lng });
            }
          }
        });
      }
    });
  
    // Calculate the midpoint
    const midLat = pointCount > 0 ? totalLat / pointCount : 0;
    const midLng = pointCount > 0 ? totalLng / pointCount : 0;
  
    // Set the map center to the midpoint and adjust zoom
    mapInstance.current.setCenter({ lat: midLat, lng: midLng });
    mapInstance.current.setZoom(10); 
  };
  
  
  const clearData = (type) => {
    polylineRefs.current[type].forEach((polyline) =>
      mapInstance.current.removeObject(polyline)
    );
    polylineRefs.current[type] = [];
    markerRefs.current[type].forEach((marker) =>
      mapInstance.current.removeObject(marker)
    );
    markerRefs.current[type] = [];
  };

  const renderEntities = (coords, type) => {
    if (!mapInstance.current || !coords) return;
    clearData(type);

    coords.forEach((coord, index) => {
      if (coord && Array.isArray(coord.coords)) {
        const lineString = new H.geo.LineString();
        coord.coords.forEach((point) =>
          lineString.pushPoint({ lat: point.lat, lng: point.lng })
        );

        const color =
          routeColors && routeColors[index % routeColors.length]
            ? routeColors[index % routeColors.length]
            : '#0000FF';
        const polyline = new H.map.Polyline(lineString, {
          style: { lineWidth: 5, strokeColor: color },
        });
        mapInstance.current.addObject(polyline);
        polylineRefs.current[type].push(polyline);

        const startIcon = new H.map.Icon(Start_Point, {
          size: { w: 32, h: 32 },
        });
        const endIcon = new H.map.Icon(End_Point, { size: { w: 32, h: 32 } });
        const startMarker = new H.map.Marker(coord.coords[0], {
          icon: startIcon,
        });
        const endMarker = new H.map.Marker(
          coord.coords[coord.coords.length - 1],
          { icon: endIcon }
        );

        mapInstance.current.addObject(startMarker);
        mapInstance.current.addObject(endMarker);

        markerRefs.current[type].push(startMarker, endMarker);
      }
    });

    fitMapToEntities(coords);
  };

  useEffect(() => {
    renderEntities(adjustedRouteCoords, 'routes');
  }, [adjustedRouteCoords, routeColors]);

  useEffect(() => {
    renderEntities(adjustedSpaceCoords, 'spaces');
  }, [adjustedSpaceCoords, routeColors]);

  useEffect(() => {
    const initialCoords = calculateCenterAndMarker(lat, lng);
    if (
      !initialCoords ||
      isNaN(initialCoords.lat) ||
      isNaN(initialCoords.lng)
    ) {
      console.error('Invalid coordinates provided:', initialCoords);
      return;
    }

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => {
          console.error(`Failed to load script: ${src}`);
          reject();
        };
        document.body.appendChild(script);
      });
    };

    const initializeMap = () => {
      if (!window.H) {
        console.error('HERE Maps API is not loaded');
        return;
      }
      if (!apiKey) {
        console.error('HERE Maps API key is missing');
        return;
      }
      if (mapInstance.current) {
        return;
      }

      try {
        platformInstance.current = new H.service.Platform({ apiKey });
        const defaultLayers = platformInstance.current.createDefaultLayers();

        mapInstance.current = new H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            zoom: Number(process.env.REACT_APP_ZOOM) || 14,
            center: initialCoords,
          }
        );

        new H.mapevents.Behavior(
          new H.mapevents.MapEvents(mapInstance.current)
        );
        window.addEventListener('resize', () =>
          mapInstance.current.getViewPort().resize()
        );

        const defaultMarker = new H.map.Marker(initialCoords);
        mapInstance.current.addObject(defaultMarker);
        markerRef.current = defaultMarker;

        mapInstance.current.addEventListener('tap', (evt) => {
          const clickedCoords = mapInstance.current.screenToGeo(
            evt.currentPointer.viewportX,
            evt.currentPointer.viewportY
          );
          if (typeof locationCoords === 'function') {
            locationCoords({ lat: clickedCoords.lat, lng: clickedCoords.lng });
          }
        });
      } catch (error) {
        console.error('Map initialization error:', error);
      }
    };

    loadScript('https://js.api.here.com/v3/3.1/mapsjs-core.js')
      .then(() =>
        loadScript('https://js.api.here.com/v3/3.1/mapsjs-service.js')
      )
      .then(() => loadScript('https://js.api.here.com/v3/3.1/mapsjs-ui.js'))
      .then(() =>
        loadScript('https://js.api.here.com/v3/3.1/mapsjs-mapevents.js')
      )
      .then(() => initializeMap())
      .catch((error) =>
        console.error('Failed to load HERE Maps API scripts', error)
      );
  }, []);

  return <div ref={mapRef} style={{ height: '87.8vh' }} />;
};

export default HereMap;
