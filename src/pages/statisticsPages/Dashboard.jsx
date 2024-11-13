import { Outlet } from "react-router-dom";
import StatSideBar from "../../components/slideOver/StatSideBar";
import StatTopNavBar from "../../components/navbars/StatTopNavBar";

export default function Dashboard() {
  return (
    <>
      <StatTopNavBar />
      <StatSideBar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
