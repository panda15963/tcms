import { useEffect, useState, useRef } from 'react';
import End_Point from '../../img/Multi End Point.svg'; // Import your custom End Point icon
import Start_Point from '../../img/Multi Start Point.svg'; // Import your custom Start Point icon

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
  routeColors = () => {},
  routeFullCoords,
  spaceFullCoords,
  clickedNode,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref
  const [routeObjects, setRouteObjects] = useState([]); // Store route objects for clearing
  const [routeMarkers, setRouteMarkers] = useState([]); // Store markers for clearing
  const [spaceObjects, setSpaceObjects] = useState([]);
  const [spaceMarkers, setSpaceMarkers] = useState([]);

  // 경로와 마커를 모두 삭제하는 함수
  const clearRoutesAndMarkers = () => {
    // 지도에서 모든 경로(폴리라인) 제거
    routeObjects.forEach((route) => {
      if (route && typeof route.setMap === 'function') {
        route.setMap(null); // 지도에서 폴리라인 제거
      }
    });
    setRouteObjects([]); // 경로 객체 상태 초기화

    // 지도에서 모든 마커 제거
    routeMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null); // 지도에서 마커 제거
      }
    });
    setRouteMarkers([]); // 마커 상태 초기화
  };

  const clearSpaceAndMarkers = () => {
    spaceObjects.forEach((route) => {
      if (route && typeof route.setMap === 'function') {
        route.setMap(null); // 지도에서 폴리라인 제거
      }
    });
    setSpaceObjects([]); // 경로 객체 상태 초기화

    spaceMarkers.forEach((marker) => {
      if (marker && typeof marker.setMap === 'function') {
        marker.setMap(null); // 지도에서 마커 제거
      }
    });
    setSpaceMarkers([]); // 마커 상태 초기화
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
  const previousColorsRef = useRef([]); // Store previous colors

  const drawCheckedRoutes = (mapInstance, routeFullCoords) => {
    clearRoutesAndMarkers(); // Clear any existing routes and markers

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // Initialize bounds to fit all routes
    const newColors = [];

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
          newColors.push(strokeColor);

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
              icon: {
                url: Start_Point, // Use the custom Start_Point icon
                scaledSize: new routo.maps.Size(30, 30), // Adjust size as needed
              },
            });

            const endMarker = new routo.maps.Marker({
              position: routePath[routePath.length - 1],
              map: mapInstance,
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

    if (
      JSON.stringify(newColors) !== JSON.stringify(previousColorsRef.current)
    ) {
      previousColorsRef.current = newColors;
      routeColors(newColors); // Update parent with new colors
    }

    setRouteObjects(newRouteObjects); // Update the state to hold the drawn route objects
    setRouteMarkers(newRouteMarkers); // Update the state to hold the drawn markers
  };

  const drawSpaceRoutes = (mapInstance, spaceFullCoords) => {
    clearSpaceAndMarkers(); // Clear any existing routes and markers

    const newRouteObjects = [];
    const newRouteMarkers = [];
    const bounds = new routo.maps.LatLngBounds(); // Initialize bounds to fit all routes
    const newColors = [];

    if (Array.isArray(spaceFullCoords)) {
      spaceFullCoords.forEach((space, index) => {
        if (Array.isArray(space.coords)) {
          const spacePath = space.coords
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
          spacePath.forEach((point) => {
            bounds.extend(new routo.maps.LatLng(point.lat, point.lng));
          });

          // Select a color based on the index, loop back if more routes than colors
          const strokeColor = colors[index % colors.length];
          newColors.push(strokeColor);

          // Create and draw the polyline with the selected color
          const polyline = new routo.maps.Polyline({
            path: spacePath,
            geodesic: true,
            strokeColor: strokeColor, // Use the selected color
            strokeOpacity: 1.0,
            strokeWeight: 2,
            map: mapInstance,
          });

          newRouteObjects.push(polyline);

          if (spacePath.length > 0) {
            const startMarker = new routo.maps.Marker({
              position: spacePath[0],
              map: mapInstance,
              icon: {
                url: Start_Point, // Use the custom Start_Point icon
                scaledSize: new routo.maps.Size(30, 30), // Adjust size as needed
              },
            });

            const endMarker = new routo.maps.Marker({
              position: spacePath[spacePath.length - 1],
              map: mapInstance,
              icon: {
                url: End_Point, // Use the custom End_Point icon
                scaledSize: new routo.maps.Size(30, 30), // Adjust size as needed
              },
            });

            newRouteMarkers.push(startMarker, endMarker);
          }
        } else {
          console.warn(
            `space.coords for space ${index} is not in the expected format.`,
          );
        }
      });
    } else {
      console.warn('spaceFullCoords is not an array.');
    }

    if (
      JSON.stringify(newColors) !== JSON.stringify(previousColorsRef.current)
    ) {
      routeColors(newColors); // Update parent with new colors
    }

    setSpaceObjects(newRouteObjects); // Update the state to hold the drawn route objects
    setSpaceMarkers(newRouteMarkers); // Update the state to hold the drawn markers
  };

  // Add useEffect to draw space routes
  useEffect(() => {
    if (mapRef.current && Array.isArray(spaceFullCoords)) {
      drawSpaceRoutes(mapRef.current, spaceFullCoords);
    }
  }, [mapRef.current, spaceFullCoords]);

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
