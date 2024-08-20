import { Outlet } from 'react-router-dom';
import TopMenuBar from '../components/navbars/TopMenuBar';
import LeftSideSlide from '../components/slideOver/LeftSideSlide';
import RightSideSlide from '../components/slideOver/RightSideSlide';

// MapLayout 컴포넌트 정의
export default function MapLayout() {
  return (
    <>
      {/* 상단 메뉴바 */}
      <TopMenuBar />

      {/* 좌측 슬라이드 패널 */}
      <LeftSideSlide />

      {/* 우측 슬라이드 패널 */}
      <RightSideSlide />

      {/* Outlet은 중첩된 라우트에 의해 선택된 컴포넌트를 렌더링 */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
