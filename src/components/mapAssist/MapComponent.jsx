import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleGeom } from 'ol/geom';

const MapComponent = ({ radius }) => {
  const mapRef = useRef();

  useEffect(() => {
    const center = fromLonLat([126.978, 37.5665]); // 서울 중심 좌표

    const vectorSource = new VectorSource();
    const circleFeature = new Feature({
      geometry: new CircleGeom(center, radius),
    });

    circleFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 255, 0.1)',
        }),
      }),
    );

    vectorSource.addFeature(circleFeature);

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center: center,
        zoom: 11,
      }),
    });

    return () => map.setTarget(null); // 컴포넌트 언마운트 시 메모리 해제
  }, [radius]);

  return <div ref={mapRef} style={{ width: '100%', height: '130px' }} />;
};

export default MapComponent;
