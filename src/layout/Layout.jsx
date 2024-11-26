import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbars/Navbar';

// Layout 컴포넌트 정의
export default function Layout() {
  console.log('여기도??');

  return (
    <>
      {/* 네비게이션 바 렌더링 */}
      <Navbar />

      {/* Outlet 컴포넌트는 중첩된 라우트에 의해 선택된 컴포넌트를 렌더링 */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
