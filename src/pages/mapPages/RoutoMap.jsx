import { useEffect, useState, useRef, useMemo } from 'react';

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
  origins,
  destinations,
  clickedNode, // The clicked route node with start and goal coordinates
  checkedNodes, // The checked routes (array of start and goal coordinates)
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref
  const [routeObjects, setRouteObjects] = useState([]); // Store route objects for clearing
  const [routeMarkers, setRouteMarkers] = useState([]); // Store markers for clearing
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(null); // Track which route is selected

  // Clear routes and markers when updating the map
  const clearRoutesAndMarkers = () => {
    routeObjects.forEach((routeArray) => {
      if (Array.isArray(routeArray)) {
        routeArray.forEach((route) => {
          if (route && typeof route.setMap === 'function') {
            route.setMap(null); // Remove individual route from the map
          }
        });
      }
    });
    setRouteObjects([]); // Clear the state

    routeMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null); // Remove marker from the map
      }
    });
    setRouteMarkers([]); // Clear the state
  };

  // Memoized processing of origins and destinations to avoid recalculating on every render
  const processedOrigins = useMemo(() => {
    if (!origins) return null;
    if (Array.isArray(origins)) {
      return origins.map((origin) => {
        const [lng, lat] = origin.split(',').map(parseFloat);
        return { lat, lng };
      });
    }
    if (typeof origins === 'string') {
      const [lng, lat] = origins.split(',').map(parseFloat);
      return { lat, lng };
    }
    if (origins.lat && origins.lng) {
      return { lat: origins.lat, lng: origins.lng };
    }
    return null;
  }, [origins]);

  const processedDestinations = useMemo(() => {
    if (!destinations) return null;
    if (Array.isArray(destinations)) {
      return destinations.map((destination) => {
        const [lng, lat] = destination.split(',').map(parseFloat);
        return { lat, lng };
      });
    }
    if (typeof destinations === 'string') {
      const [lng, lat] = destinations.split(',').map(parseFloat);
      return { lat, lng };
    }
    if (destinations.lat && destinations.lng) {
      return { lat: destinations.lat, lng: destinations.lng };
    }
    return null;
  }, [destinations]);

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

  // Function to draw routes for checkedNodes
  const drawCheckedRoutes = (mapInstance, checkedNodes) => {
    clearRoutesAndMarkers(); // Clear any existing routes

    const newRouteObjects = [];
    const newRouteMarkers = [];

    checkedNodes.forEach((node, index) => {
      const [startLng, startLat] = node.start_coord.split(',').map(parseFloat);
      const [goalLng, goalLat] = node.goal_coord.split(',').map(parseFloat);

      if (!startLng || !startLat || !goalLng || !goalLat) return;

      // Parameters for route
      const parameters = {
        RPOption: [{ FeeOption: 0, RoadOption: 0, RouteOption: 0 }],
        CoordType: 2,
        CarType: 0,
        StartPoint: {
          XPos: startLng,
          YPos: startLat,
          Name: `출발지 ${index + 1}`,
        },
        GoalPoint: {
          XPos: goalLng,
          YPos: goalLat,
          Name: `도착지 ${index + 1}`,
        },
      };

      // Fetch and draw each checked route
      fetch('https://mlp.hyundai-mnsoft.com:9144/mlp/rtsrch', {
        mode: 'cors',
        method: 'post',
        headers: {
          AuthCode: 'AB7B15940E89447C',
          UniqueId: '01012345678',
          Version: '1.1.0',
          ServiceId: '5000',
          MsgId: 'RCH03',
          coordinate: 'G',
          ReqCompression: '0',
          ReqEncription: '0',
          ReqFormat: 'J',
          RespCompression: '0',
          RespEncription: '0',
          RespFormat: 'J',
          Country: '1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      })
        .then((response) => response.json())
        .then((json) => {
          const jsonTraffic = routo.maps.Traffic.trafficRead(json);
          const routeLine = routo.maps.Traffic.drawRouteLineByTraffic(
            mapInstance,
            jsonTraffic,
          );

          newRouteObjects.push(routeLine);

          const startMarker = new routo.maps.Marker({
            position: { lat: startLat, lng: startLng },
            clickable: false,
            icon: {
              path: routo.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#d4dc72',
            },
            label: `출발 ${index + 1}`,
            map: mapInstance,
          });

          const goalMarker = new routo.maps.Marker({
            position: { lat: goalLat, lng: goalLng },
            clickable: false,
            icon: {
              path: routo.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#d4dc72',
            },
            label: `종료 ${index + 1}`,
            map: mapInstance,
          });

          newRouteMarkers.push(startMarker, goalMarker);
        });
    });

    setRouteObjects(newRouteObjects);
    setRouteMarkers(newRouteMarkers);

    // Fit map to bounds (Korean Peninsula) after drawing all checked routes
    fitMapToBounds(mapInstance, checkedNodes);
  };

  // Handle checked routes when checkedNodes changes
  useEffect(() => {
    if (checkedNodes && Array.isArray(checkedNodes)) {
      if (mapRef.current) {
        drawCheckedRoutes(mapRef.current, checkedNodes);
      }
    }
  }, [checkedNodes]);

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
