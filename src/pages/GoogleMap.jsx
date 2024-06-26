import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function GoogleMap() {
  const position = { lat: 53.54992, lng: 10.00678 };

  return (
    <>
      <APIProvider apiKey="AIzaSyCIobZGCZzf-wbQlKQb6Ae2VWP2RrEdlog">
        <Map
          style={{ height: `calc(100vh - 130px)`, zIndex: '1' }}
          defaultCenter={position}
          defaultZoom={10}
        >
          <Marker position={position} />
        </Map>
      </APIProvider>
    </>
  );
}
