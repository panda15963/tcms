import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbars/Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}