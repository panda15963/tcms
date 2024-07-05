import React, { useEffect } from 'react';

export default function BaiduMapComponent(){
  useEffect(() => {
    const loadBaiduMap = () => {
      const script = document.createElement('script');
      script.src =
        'https://api.map.baidu.com/api?v=3.0&type=webgl&ak=pk4x7SQnHzjrRn3FwPPXZCIdxcn5YQ2r';
      script.onload = () => {
        const map = new window.BMapGL.Map('allmap');
        map.centerAndZoom(new window.BMapGL.Point(116.28019, 40.049191), 19);
        map.enableScrollWheelZoom(true);
        map.setHeading(64.5);
        map.setTilt(73);
      };
      document.head.appendChild(script);
    };

    loadBaiduMap();
  }, []);

  return <div id="allmap" className="w-full h-screen" style={{ height: `calc(100vh - 130px)`, zIndex: '1' }}></div>;
};