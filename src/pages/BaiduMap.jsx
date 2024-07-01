import React from 'react';
import { Map, Marker, NavigationControl, InfoWindow, MapApiLoaderHOC } from 'react-bmapgl';

const BaiduMapComponent = () => {
  return (
    <Map center={{ lng: 116.404, lat: 39.915 }} zoom="15" style={{ width: '100%', height: '400px' }}>
      <Marker position={{ lng: 116.404, lat: 39.915 }} />
      <NavigationControl />
      <InfoWindow position={{ lng: 116.404, lat: 39.915 }} text="Hello, Baidu Map!" title="Info Window" />
    </Map>
  );
};

// Use the HOC to load the API
const BaiduMap = MapApiLoaderHOC({ ak: 'npGHwQuv3UzGZgeQBLe0lkDorJx9b8gn' })(BaiduMapComponent);

export default BaiduMap;
