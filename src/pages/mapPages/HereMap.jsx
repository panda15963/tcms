/* global H */
import React, { useEffect, useRef } from 'react';
import End_Point from '../../assets/images/multi_end_point.svg';
import Start_Point from '../../assets/images/multi_start_point.svg';

function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE) || 0;
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE) || 0;
  return lat && lng
    ? { lat: parseFloat(lat), lng: parseFloat(lng) }
    : { lat: defaultLat, lng: defaultLng };
}

const HereMap = ({ lat, lng, locationCoords = () => {}, routeFullCoords }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const platformInstance = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const apiKey = process.env.REACT_APP_HERE_MAP_API;

  // Function to fit map bounds and center to the midpoint of multiple routes
  const fitMapToRoute = () => {
    if (
      !routeFullCoords ||
      routeFullCoords.length === 0 ||
      !mapInstance.current
    ) {
      return;
    }

    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;
    let bounds;

    routeFullCoords.forEach((coord) => {
      if (Array.isArray(coord.coords)) {
        coord.coords.forEach((point) => {
          if (
            point &&
            typeof point.lat === 'number' &&
            typeof point.lng === 'number'
          ) {
            // Initialize bounds with the first valid point
            if (!bounds) {
              bounds = new H.geo.Rect(
                point.lat,
                point.lng,
                point.lat,
                point.lng
              );
            } else {
              bounds.mergePoint({ lat: point.lat, lng: point.lng });
            }
            // Sum latitude and longitude for midpoint calculation
            totalLat += point.lat;
            totalLng += point.lng;
            pointCount++;
          }
        });
      }
    });

    if (pointCount > 0 && bounds) {
      // Calculate the midpoint
      const midLat = totalLat / pointCount;
      const midLng = totalLng / pointCount;

      // Set the view based on bounds and center the map to the midpoint
      mapInstance.current.getViewModel().setLookAtData({
        bounds: bounds,
        position: { lat: midLat, lng: midLng },
      });
    } else {
      console.warn('No valid route points to fit the map view.');
    }
  };

  useEffect(() => {
    if (
      mapInstance.current &&
      Array.isArray(routeFullCoords) &&
      routeFullCoords.length > 0
    ) {
      if (polylineRef.current && polylineRef.current.length > 0) {
        polylineRef.current.forEach((polyline) => {
          mapInstance.current.removeObject(polyline);
        });
      }
      polylineRef.current = []; // Clear existing references

      routeFullCoords.forEach((coord, index) => {
        if (Array.isArray(coord.coords)) {
          const lineString = new H.geo.LineString();

          coord.coords.forEach((point) => {
            if (
              point &&
              typeof point.lat === 'number' &&
              typeof point.lng === 'number'
            ) {
              lineString.pushPoint({ lat: point.lat, lng: point.lng });
            }
          });

          if (lineString.getPointCount() > 0) {
            const newPolyline = new H.map.Polyline(lineString, {
              style: { lineWidth: 5 },
            });
            mapInstance.current.addObject(newPolyline);
            polylineRef.current.push(newPolyline);

            const startIcon = new H.map.Icon(Start_Point, {
              size: { w: 32, h: 32 },
            });
            const endIcon = new H.map.Icon(End_Point, {
              size: { w: 32, h: 32 },
            });

            const startMarker = new H.map.Marker(coord.coords[0], {
              icon: startIcon,
            });
            const endMarker = new H.map.Marker(
              coord.coords[coord.coords.length - 1],
              { icon: endIcon }
            );

            mapInstance.current.addObject(startMarker);
            mapInstance.current.addObject(endMarker);
          }
        }
      });

      // Call fitMapToRoute after adding all polylines and markers
      fitMapToRoute();
    } else if (polylineRef.current) {
      polylineRef.current.forEach((polyline) => {
        mapInstance.current.removeObject(polyline);
      });
      polylineRef.current = [];
    }
  }, [routeFullCoords]);

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
