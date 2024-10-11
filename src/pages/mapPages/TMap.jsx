import { useEffect, useState, useRef } from 'react';
import '../../style/MapStyle.css'; // Ensure this CSS file exists

// Function to parse the coordinates string
function parseCoordinates(coordString) {
  const [lng, lat] = coordString.split(',').map(Number); // Split and convert to numbers
  return { lat, lng };
}

// Function to handle both single and multiple coordinates
function handleCoordinateInput(input) {
  if (typeof input === 'string') {
    return [parseCoordinates(input)]; // Return as an array with one element
  } else if (Array.isArray(input)) {
    return input.map((coordString) => parseCoordinates(coordString));
  } else {
    return []; // If input is invalid, return an empty array
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
  origins,
  destinations,
  checkedNodes,
  clickedNode,
}) {
  const initialCoords = calculateCenterAndMarker(lat, lng); // 초기 지도 중심 좌표 계산
  const [center, setCenter] = useState(initialCoords); // 지도 중심 좌표 상태 관리
  const mapRef = useRef(null); // 지도 인스턴스를 참조하기 위한 ref
  const markerRef = useRef(null); // 마커 인스턴스를 참조하기 위한 ref
  const zoomSetRef = useRef(false); // Track if zoom has been set

  const startMarkerRef = useRef([]); // Multiple start markers
  const finishMarkerRef = useRef([]); // Multiple finish markers
  const polylineRef = useRef([]); // To store polylines

  const parsedOrigins = handleCoordinateInput(origins) || [];
  const parsedDestinations = handleCoordinateInput(destinations) || [];

  // lat와 lng가 변경될 때마다 지도 중심 좌표 업데이트
  useEffect(() => {
    const newCenter = calculateCenterAndMarker(lat, lng);
    setCenter(newCenter);
  }, [lat, lng]);

  console.log('checkedNodes ==>', checkedNodes);

  // TMap 스크립트 로드 및 지도 초기화
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

  // 지도 중심 좌표가 변경될 때마다 지도 업데이트
  useEffect(() => {
    if (mapRef.current) {
      updateMapCenter(); // 지도 중심 및 마커 업데이트
    }
  }, [center]);

  // Define the missing updateMapCenter function
  function updateMapCenter() {
    const { Tmapv2 } = window;
    if (mapRef.current && Tmapv2) {
      mapRef.current.setCenter(new Tmapv2.LatLng(center.lat, center.lng));

      if (markerRef.current) {
        markerRef.current.setMap(null); // 기존 마커가 있으면 제거
      }

      // 새로운 마커를 지도에 추가
      markerRef.current = new Tmapv2.Marker({
        position: new Tmapv2.LatLng(center.lat, center.lng),
        map: mapRef.current,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        iconSize: new Tmapv2.Size(32, 32),
      });
    }
  }

  // Effect for clickedNode to center map on the clicked route
  useEffect(() => {
    if (
      clickedNode &&
      clickedNode.start_coord &&
      clickedNode.goal_coord &&
      mapRef.current
    ) {
      const { lat: startLat, lng: startLng } = parseCoordinates(
        clickedNode.start_coord,
      );

      // Center the map on the start location of the clicked node
      const centerCoords = new window.Tmapv2.LatLng(startLat, startLng);
      mapRef.current.setCenter(centerCoords); // Center map on the start location
      mapRef.current.setZoom(10); // Optionally, zoom in when a route is clicked
      console.log('Clicked node', clickedNode);
    }
  }, [clickedNode]);

  // Effect to handle route updates and markers
  useEffect(() => {
    async function fetchRoutesAndUpdateMap() {
      const { Tmapv2 } = window;
      let latSum = 0;
      let lngSum = 0;
      let pointCount = 0; // Track the number of points to calculate the center

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

      // If no routes are selected, log and return
      if (parsedOrigins.length === 0 || parsedDestinations.length === 0) {
        console.log('No routes selected');
        return;
      }

      // Loop through filtered origins and destinations
      for (let i = 0; i < parsedOrigins.length; i++) {
        const origin = parsedOrigins[i];
        const destination =
          parsedDestinations[i] ||
          parsedDestinations[parsedDestinations.length - 1];

        const url = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&appKey=${process.env.REACT_APP_TMAP_API}`;

        const body = {
          startX: origin.lng,
          startY: origin.lat,
          endX: destination.lng,
          endY: destination.lat,
          reqCoordType: 'WGS84GEO',
          resCoordType: 'EPSG3857',
          searchOption: '0',
          trafficInfo: 'N',
        };

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }

          const data = await response.json();

          // Convert EPSG3857 coordinates to WGS84 for rendering on map
          function convertEPSG3857ToWGS84(x, y) {
            const lng = (x / 6378137) * (180 / Math.PI);
            const lat =
              (Math.atan(Math.exp(y / 6378137)) * 2 - Math.PI / 2) *
              (180 / Math.PI);
            return { lat, lng };
          }

          if (data.features && data.features.length) {
            const path = data.features
              .filter((feature) => feature.geometry.type === 'LineString')
              .flatMap((feature) => {
                return feature.geometry.coordinates.map(([x, y]) => {
                  const { lat, lng } = convertEPSG3857ToWGS84(x, y);
                  const latLng = new Tmapv2.LatLng(lat, lng);

                  // Add to sums for calculating center
                  latSum += lat;
                  lngSum += lng;
                  pointCount++;

                  return latLng;
                });
              });

            // Create polyline for the route
            const polyline = new Tmapv2.Polyline({
              path,
              strokeColor: '#0000FF', // Route color
              strokeWeight: 5,
              map: mapRef.current, // Add the polyline to the map
            });
            polylineRef.current.push(polyline);

            // Add start marker
            const startMarker = new Tmapv2.Marker({
              position: new Tmapv2.LatLng(origin.lat, origin.lng),
              label: `출발지 ${i + 1}`,
              map: mapRef.current,
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              iconSize: new Tmapv2.Size(32, 32),
            });
            startMarkerRef.current.push(startMarker);

            // Add finish marker
            const finishMarker = new Tmapv2.Marker({
              position: new Tmapv2.LatLng(destination.lat, destination.lng),
              label: `도착지 ${i + 1}`,
              map: mapRef.current,
              icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
              iconSize: new Tmapv2.Size(32, 32),
            });
            finishMarkerRef.current.push(finishMarker);

            // Also include origin and destination in center calculation
            latSum += origin.lat + destination.lat;
            lngSum += origin.lng + destination.lng;
            pointCount += 2;
          }
        } catch (error) {
          console.error('Error fetching route:', error.message);
        }
      }

      // Calculate the center by averaging latitudes and longitudes
      if (pointCount > 0) {
        if (!zoomSetRef.current) {
          mapRef.current.setZoom(7); // Set zoom once
          zoomSetRef.current = true; // Mark zoom as set
        }
      }
    }

    // Check if we have valid data to proceed
    if (
      parsedOrigins.length &&
      parsedDestinations.length &&
      checkedNodes.length > 0
    ) {
      fetchRoutesAndUpdateMap();
    }
  }, [parsedOrigins, parsedDestinations, checkedNodes]);

  /**
   * 지도 초기화 함수
   * 지도 인스턴스를 생성하고 클릭 이벤트 리스너를 추가
   */
  function initMap() {
    if (mapRef.current) return; // 이미 초기화된 경우 종료

    const { Tmapv2 } = window;
    mapRef.current = new Tmapv2.Map('map_div', {
      center: new Tmapv2.LatLng(center.lat, center.lng),
      zoom: Number(process.env.REACT_APP_ZOOM),
    });

    // 지도 클릭 이벤트 리스너 추가
    mapRef.current.addListener('click', (evt) => {
      const clickedLat = evt.latLng.lat();
      const clickedLng = evt.latLng.lng();
      locationCoords({ lat: clickedLat, lng: clickedLng });
    });

    updateMapCenter(); // 초기 마커 설정
  }

  return <div id="map_div" className="map" />;
}
