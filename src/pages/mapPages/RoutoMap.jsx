import { useEffect, useState, useRef } from 'react';
import End_Point from '../../img/Multi End Point.svg'; // Import your custom End Point icon
import Start_Point from '../../img/Multi Start Point.svg'; // Import your custom Start Point icon

/**
 * 중심 좌표와 마커 좌표를 계산하는 함수
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @returns {Object} - 위도와 경도를 포함한 객체
 */
function calculateCenterAndMarker(lat, lng) {
  const defaultLat = parseFloat(process.env.REACT_APP_LATITUDE); // 환경 변수에서 기본 위도 값 가져오기
  const defaultLng = parseFloat(process.env.REACT_APP_LONGITUDE); // 환경 변수에서 기본 경도 값 가져오기
  if (lat !== undefined && lng !== undefined) {
    return { lat: parseFloat(lat), lng: parseFloat(lng) }; // lat와 lng가 정의되어 있으면 해당 값 사용
  }
  return { lat: defaultLat, lng: defaultLng }; // 그렇지 않으면 기본 좌표 사용
}

/**
 * RoutoMap 컴포넌트
 * @param {number} lat - 위도 값
 * @param {number} lng - 경도 값
 * @param {function} locationCoords - 클릭한 좌표를 부모로 전달하기 위한 함수
 */
export default function RoutoMap({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords,
  clickedNode, // The clicked route node with start and goal coordinates
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref
  const [routeObjects, setRouteObjects] = useState([]); // Store route objects for clearing
  const [routeMarkers, setRouteMarkers] = useState([]); // Store markers for clearing
  console.log(routeFullCoords);
  // Clear routes and markers when updating the map
  const clearRoutesAndMarkers = () => {
    routeObjects.forEach((routeArray) => {
      if (Array.isArray(routeArray)) {
        routeArray.forEach((route) => {
          if (route && typeof route.setMap === 'function') {
            route.setMap(null);
          }
        });
      }
    });
    setRouteObjects([]);

    routeMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null);
      }
    });
    setRouteMarkers([]);
  };

  // Function to fit map to bounds
  const fitMapToBounds = (mapInstance, checkedNodes) => {
    const bounds = new routo.maps.LatLngBounds();

    // Add each start and goal point to the bounds
    checkedNodes.forEach((node) => {
      const [startLng, startLat] = node.start_coord.split(',').map(parseFloat);
      const [goalLng, goalLat] = node.goal_coord.split(',').map(parseFloat);

      bounds.extend(new routo.maps.LatLng(startLat, startLng));
      bounds.extend(new routo.maps.LatLng(goalLat, goalLng));
    });

    // Adjust the map to fit all the bounds
    mapInstance.fitBounds(bounds);
  };

  const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080']; // Define different colors

  const drawCheckedRoutes = (mapInstance, routeFullCoords) => {
    clearRoutesAndMarkers(); // Clear any existing routes and markers

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // Initialize bounds to fit all routes

    if (Array.isArray(routeFullCoords)) {
      routeFullCoords.forEach((route, index) => {
        if (Array.isArray(route.coords)) {
          const routePath = route.coords
            .map((coord) => {
              if (Array.isArray(coord)) {
                const [lng, lat] = coord;
                return { lat, lng };
              } else if (coord.lat !== undefined && coord.lng !== undefined) {
                return { lat: coord.lat, lng: coord.lng };
              } else {
                console.warn('Unexpected coord format:', coord);
                return null;
              }
            })
            .filter(Boolean);

          // Extend bounds with all route points
          routePath.forEach((point) => {
            bounds.extend(new routo.maps.LatLng(point.lat, point.lng));
          });

          // Select a color based on the index, loop back if more routes than colors
          const strokeColor = colors[index % colors.length];

          // Create and draw the polyline with the selected color
          const polyline = new routo.maps.Polyline({
            path: routePath,
            geodesic: true,
            strokeColor: strokeColor, // Use the selected color
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: mapInstance,
          });

          newRouteObjects.push(polyline);

          if (routePath.length > 0) {
            const startMarker = new routo.maps.Marker({
              position: routePath[0],
              map: mapInstance,
              label: `Start ${index + 1}`,
              icon: {
                url: Start_Point, // Use the custom Start_Point icon
                scaledSize: new routo.maps.Size(30, 30), // Adjust size as needed
              },
            });

            const endMarker = new routo.maps.Marker({
              position: routePath[routePath.length - 1],
              map: mapInstance,
              label: `End ${index + 1}`,
              icon: {
                url: End_Point, // Use the custom End_Point icon
                scaledSize: new routo.maps.Size(30, 30), // Adjust size as needed
              },
            });

            newRouteMarkers.push(startMarker, endMarker);
          }
        } else {
          console.warn(
            `route.coords for route ${index} is not in the expected format.`,
          );
        }
      });
    } else {
      console.warn('routeFullCoords is not an array.');
    }

    setRouteObjects(newRouteObjects); // Update the state to hold the drawn route objects
    setRouteMarkers(newRouteMarkers); // Update the state to hold the drawn markers
    mapInstance.setZoom(8); // Set zoom level to zoom out
  };

  // Center the map on the clicked route when clickedNode is provided
  useEffect(() => {
    if (clickedNode && clickedNode.start_coord && clickedNode.goal_coord) {
      const [startLng, startLat] = clickedNode.start_coord
        .split(',')
        .map(parseFloat);
      const [goalLng, goalLat] = clickedNode.goal_coord
        .split(',')
        .map(parseFloat);

      if (mapRef.current) {
        const bounds = new routo.maps.LatLngBounds();

        // Extend the bounds with both start and goal points
        bounds.extend(new routo.maps.LatLng(startLat, startLng));
        bounds.extend(new routo.maps.LatLng(goalLat, goalLng));

        // Adjust the map to fit the bounds, centering on the route
        mapRef.current.fitBounds(bounds);

        // Optionally hide the marker when focusing on routes
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
      }
    }
  }, [clickedNode]);

  // Function to re-attach the click listener
  const attachClickListener = () => {
    if (mapRef.current) {
      routo.maps.event.clearListeners(mapRef.current, 'click'); // Clear existing listeners
      mapRef.current.addListener('click', (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();
        locationCoords({ lat: clickedLat, lng: clickedLng });
      });
    }
  };

  // Initialize the map with marker for the initial center
  useEffect(() => {
    const loadMapScript = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.routo.com/v2/maps/map?key=' +
        process.env.REACT_APP_ROUTTO_MAP_API;
      script.async = true;
      script.onload = () => {
        if (!mapRef.current) {
          mapRef.current = new routo.maps.Map(document.getElementById('map'), {
            center: { lat: center.lat, lng: center.lng },
            zoom: Number(process.env.REACT_APP_ZOOM),
          });

          markerRef.current = new routo.maps.Marker({
            position: { lat: center.lat, lng: center.lng },
            map: mapRef.current,
          });

          attachClickListener(); // Attach click listener after map is initialized
        }
      };
      document.body.appendChild(script);
    };

    if (!window.routo) {
      loadMapScript();
    } else {
      if (!mapRef.current) {
        mapRef.current = new routo.maps.Map('map', {
          center: { lat: center.lat, lng: center.lng },
          zoom: Number(process.env.REACT_APP_ZOOM),
        });
      }

      if (!markerRef.current) {
        markerRef.current = new routo.maps.Marker({
          position: { lat: center.lat, lng: center.lng },
          map: mapRef.current,
        });
      } else {
        markerRef.current.setPosition({ lat: center.lat, lng: center.lng });
      }

      attachClickListener(); // Re-attach click listener after map is set up
    }

    return () => {
      if (mapRef.current) {
        routo.maps.event.clearListeners(mapRef.current, 'click');
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [center.lat, center.lng, locationCoords]);

  useEffect(() => {
    if (mapRef.current && Array.isArray(routeFullCoords)) {
      drawCheckedRoutes(mapRef.current, routeFullCoords);
    }
  }, [mapRef.current, routeFullCoords]);

  // Update map center based on lat and lng changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const newCenter = calculateCenterAndMarker(lat, lng);
      setCenter(newCenter);
      mapRef.current.setCenter(newCenter);
      markerRef.current.setPosition(newCenter);
    }
  }, [lat, lng]);

  return <div id="map" className="map" />;
}
