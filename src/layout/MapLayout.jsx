import { Outlet } from 'react-router-dom';
import TopMenuBar from '../components/navbars/TopMenuBar';
import LeftSideSlide from '../components/slideOver/LeftSideSlide';
import RightSideSlide from '../components/slideOver/RightSideSlide';

export default function MapLayout() {

  return (
    <>
      <TopMenuBar />
      <LeftSideSlide />
      <RightSideSlide />
      <main>
        <Outlet />
      </main>
    </>
  );
}
