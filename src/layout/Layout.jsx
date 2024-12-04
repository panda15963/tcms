import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbars/Navbar';

/**
 * Layout 컴포넌트
 *
 * 모든 페이지에 공통적으로 적용되는 레이아웃을 정의합니다.
 * 네비게이션 바와 동적으로 렌더링될 콘텐츠 영역(Outlet)을 포함합니다.
 *
 * @returns {JSX.Element} 레이아웃 컴포넌트
 * 
 * @example
 * <Route path="/" element={<Layout />}>
 *   <Route path="home" element={<HomePage />} />
 *   <Route path="about" element={<AboutPage />} />
 * </Route>
 */
export default function Layout() {
  return (
    <>
      {/* 공통 네비게이션 바 */}
      <Navbar />

      {/* Outlet 컴포넌트는 중첩된 라우트를 기반으로 렌더링될 콘텐츠를 삽입 */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
