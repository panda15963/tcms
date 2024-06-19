import MainNavbar from '../navbar/mainNavbar';
import MapNavbar from '../navbar/asisNavbar';
import CourseList from '../navbar/courseList';
import MetaDataList from '../navbar/metaDataList';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

export default function MapView() {
  const position = { lat: 53.54992, lng: 10.00678 };

  return (
    <>
      <MainNavbar />
      <main className="flex flex-row justify-between">
        <MapNavbar />
      </main>
      <div className="fixed flex flex-row grid-flow-row">
        {/* <CourseList />
          <APIProvider apiKey="AIzaSyCIobZGCZzf-wbQlKQb6Ae2VWP2RrEdlog">
            <Map
              style={{ width: '100vw', height: '100vh' }}
              defaultCenter={position}
              defaultZoom={10}
            >
              <Marker position={position} />
            </Map>
          </APIProvider> */}
      </div>
    </>
  );
}
