import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleGeom } from 'ol/geom';

const MapComponent = ({ latitude, longitude, radius, onMapClick }) => {
  const mapRef = useRef();
  const vectorSourceRef = useRef(new VectorSource());
  const mapInstance = useRef(null);

  useEffect(() => {
    const center = fromLonLat([longitude, latitude]);

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

    vectorSourceRef.current.clear();
    vectorSourceRef.current.addFeature(circleFeature);

    if (!mapInstance.current) {
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: vectorSourceRef.current,
          }),
        ],
        view: new View({
          center: center,
          zoom: 11,
        }),
      });

      // Map click event listener
      mapInstance.current.on('click', (event) => {
        const clickedCoordinate = toLonLat(event.coordinate);
        const [lon, lat] = clickedCoordinate;
        onMapClick && onMapClick({ latitude: lat, longitude: lon });
      });
    } else {
      mapInstance.current.getView().setCenter(center);
    }
  }, [latitude, longitude, radius, onMapClick]);

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="rounded-lg overflow-hidden border border-gray-300"
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapComponent;
