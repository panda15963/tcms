import { Outlet } from "react-router-dom";
import StatSideBar from "../components/slideOver/StatSideBar";
import StatTopNavBar from "../components/navbars/StatTopNavBar";

/**
 * DashboardLayout 컴포넌트
 * 
 * 대시보드 레이아웃을 구성하는 컴포넌트입니다. 상단 네비게이션 바(StatTopNavBar),
 * 사이드바(StatSideBar), 그리고 동적으로 렌더링될 메인 콘텐츠를 포함합니다.
 * 
 * @returns {JSX.Element} 대시보드 레이아웃 컴포넌트
 * 
 * @example
 * <Route path="/dashboard" element={<DashboardLayout />}>
 *   <Route path="stats" element={<StatsPage />} />
 * </Route>
 */
export default function DashboardLayout() {
  return (
    <>
      {/* 상단 네비게이션 바 */}
      <StatTopNavBar />

      {/* 사이드바 */}
      <StatSideBar />

      {/* 메인 콘텐츠 영역 */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
