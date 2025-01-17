import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from '@react-google-maps/api';
import Start_Point from '../../assets/images/multi_start_point.svg';
import End_Point from '../../assets/images/multi_end_point.svg';

const mapContainerStyle = { width: '100%', height: 'calc(100vh - 102px)' };

const defaultCenter = {
  lat: parseFloat(process.env.REACT_APP_LATITUDE) || 0,
  lng: parseFloat(process.env.REACT_APP_LONGITUDE) || 0,
};

const defaultZoom = parseInt(process.env.REACT_APP_ZOOM, 10) || 12;

const isValidCoordinate = (coord) =>
  coord && typeof coord.lat === 'number' && typeof coord.lng === 'number';

/**
 * GoogleMap 컴포넌트
 * @param {Object} props
 * @param {number} lat - 초기 지도 중심 위도 값
 * @param {number} lng - 초기 지도 중심 경도 값
 * @param {function} locationCoords - 지도 클릭 시 좌표를 부모로 전달하는 콜백
 * @param {Array} routeFullCoords - 경로를 나타내는 좌표 배열
 * @param {Object} clickedNode - 클릭된 노드 데이터
 * @param {function} error - 오류 메시지 콜백
 * @param {function} routeColors - 경로 색상을 업데이트하는 콜백
 * @param {Array} spaceFullCoords - 공간 데이터를 나타내는 좌표 배열
 * @param {boolean} onClearMap - 지도 초기화 여부
 * @param {Array} checkedNode - 선택된 노드 데이터
 * @param {String} selectedAPI - API 키
 * @param {Array} routeColors - 경로 색상 배열
 * @param {String} typeMap - 지도 타입
 */
const GoogleMaps = ({
  lat,
  lng,
  locationCoords = () => {},
  routeFullCoords = [],
  spaceFullCoords = [],
  clickedNode,
  onClearMap,
  selectedAPI,
  routeColors = () => {},
  typeMap,
}) => {
  const [map, setMap] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const routesColors = useRef(new Map());
  const choosenMap =
    typeMap === 'Basic Map'
      ? 'roadmap'
      : typeMap === 'Satellite Map'
      ? 'satellite'
      : 'hybrid';

  useEffect(() => {
    const parsedLat = isNaN(parseFloat(lat)) ? null : parseFloat(lat);
    const parsedLng = isNaN(parseFloat(lng)) ? null : parseFloat(lng);

    if (isValidCoordinate({ lat: parsedLat, lng: parsedLng })) {
      setMarkerPosition({ lat: parsedLat, lng: parsedLng });
      if (map) {
        console.log('map', map);
        map.panTo({ lat: parsedLat, lng: parsedLng });
      }
    } else {
      setMarkerPosition(null);
      if (map) {
        map.panTo(defaultCenter);
      }
    }
  }, [lat, lng, map]);

  const centerOnMultipleCoordinates = (spaces, routes) => {
    if (map) {
      const bounds = new window.google.maps.LatLngBounds();

      const addCoordsToBounds = (coords) => {
        coords.forEach((coord) => {
          if (isValidCoordinate(coord)) {
            bounds.extend({ lat: coord.lat, lng: coord.lng });
          }
        });
      };

      spaces.forEach((space) => {
        if (space.coords && Array.isArray(space.coords)) {
          addCoordsToBounds(space.coords);
        }
      });

      routes.forEach((route) => {
        if (route.coords && Array.isArray(route.coords)) {
          addCoordsToBounds(route.coords);
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  };

  useEffect(() => {
    if ((spaceFullCoords.length > 0 || routeFullCoords.length > 0) && map) {
      centerOnMultipleCoordinates(spaceFullCoords, routeFullCoords);
    }
  }, [spaceFullCoords, routeFullCoords, map]);

  const resetToDefaultView = () => {
    if (map) {
      map.panTo(defaultCenter);
      map.setZoom(defaultZoom);
    }
  };

  useEffect(() => {
    if (
      spaceFullCoords.length === 0 &&
      routeFullCoords.length === 0 &&
      routesColors.current.size > 0
    ) {
      resetToDefaultView();
      setUserInteracted(false);
    }
  }, [spaceFullCoords, routeFullCoords, userInteracted]);

  useEffect(() => {
    setUserInteracted(true);
  }, []);

  useEffect(() => {
    if (onClearMap && map) {
      // 지도 초기화
      map.panTo(defaultCenter);
      map.setZoom(defaultZoom);

      // routesColors 초기화
      routesColors.current = new Map();
    }
  }, [onClearMap, map]);

  const handleMapClick = (e) => {
    locationCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    setUserInteracted(true);
  };

  useEffect(() => {
    if (clickedNode && map) {
      const {
        bb_bottomleft_lat,
        bb_bottomleft_lng,
        bb_topright_lat,
        bb_topright_lng,
      } = clickedNode;
      if (
        bb_bottomleft_lat &&
        bb_bottomleft_lng &&
        bb_topright_lat &&
        bb_topright_lng
      ) {
        const bounds = new window.google.maps.LatLngBounds(
          { lat: bb_bottomleft_lat, lng: bb_bottomleft_lng },
          { lat: bb_topright_lat, lng: bb_topright_lng }
        );
        map.fitBounds(bounds);
      }
    }
  }, [clickedNode, map]);

  return (
    <LoadScript googleMapsApiKey={selectedAPI}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={setMap}
        onClick={handleMapClick}
        options={{
          mapTypeId: choosenMap,
          disableDefaultUI: true, // 기본 UI 비활성화
        }}
      >
        {markerPosition && <Marker position={markerPosition} />}
        {spaceFullCoords.map((space, index) => {
          if (
            space &&
            space.coords &&
            Array.isArray(space.coords) &&
            space.coords.length > 0
          ) {
            const start = space.coords[0];
            const end = space.coords[space.coords.length - 1];

            if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
              return null;
            }

            const polylineColor =
              routesColors.current.get(space.file_id) ||
              routeColors[index % routeColors.length];
            routesColors.current.set(space.file_id, polylineColor);

            return (
              <Fragment key={`space-${index}`}>
                <Marker position={start} icon={Start_Point} />
                <Marker position={end} icon={End_Point} />
                <Polyline
                  path={space.coords.filter(isValidCoordinate)}
                  options={{
                    strokeColor: polylineColor,
                    strokeOpacity: 1,
                    strokeWeight: 4,
                  }}
                />
              </Fragment>
            );
          }
          return null;
        })}

        {routeFullCoords.map((route, index) => {
          if (
            route &&
            route.coords &&
            Array.isArray(route.coords) &&
            route.coords.length > 0
          ) {
            const start = route.coords[0];
            const end = route.coords[route.coords.length - 1];

            if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
              return null;
            }

            const polylineColor =
              routesColors.current.get(route.file_id) ||
              routeColors[index % routeColors.length];
            routesColors.current.set(route.file_id, polylineColor);

            return (
              <Fragment key={`route-${index}`}>
                <Marker position={start} icon={Start_Point} />
                <Marker position={end} icon={End_Point} />
                <Polyline
                  path={route.coords.filter(isValidCoordinate)}
                  options={{
                    strokeColor: polylineColor,
                    strokeOpacity: 1,
                    strokeWeight: 4,
                  }}
                />
              </Fragment>
            );
          }
          return null;
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMaps;
