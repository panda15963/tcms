import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './style/Index.css';
import HomeLogin from './pages/HomeLogin';
import Layout from './layout/Layout';
import ManagementAdmins from './pages/ManagementAdmins';
import Dashboard from './pages/Dashboard';
import ManagementUsers from './pages/ManagementUsers';
import TMap from './pages/TMap';
import GoogleMap from './pages/GoogleMap';
import RoutoMap from './pages/RoutoMap';
import TomTomMap from './pages/TomTomMap';
import MapLayout from './layout/MapLayout';
import BaiduMap from './pages/BaiduMap';

// Current Pending MAP
import HereMap from './pages/HereMap';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeLogin />} />
          <Route path="/main" element={<Layout />}>
            <Route path="/main/map" element={<MapLayout />}>
              <Route path="google" element={<GoogleMap />} />
              <Route path="tmap" element={<TMap />} />
              <Route path="routo" element={<RoutoMap />} />
              <Route path="tomtom" element={<TomTomMap />} />
              <Route path="here" element={<HereMap />} />
              <Route path="baidu" element={<BaiduMap />} />
            </Route>
            <Route path="/main/admins" element={<ManagementAdmins />} />
            <Route path="/main/users" element={<ManagementUsers />} />
            <Route path="/main/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StrictMode>
);
