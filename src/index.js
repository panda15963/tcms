import './style/Index.css';
import HomeLogin from './pages/HomeLogin';
import Layout from './layout/Layout';
import ManagementAdmins from './pages/ManagementAdmins';
import Dashboard from './pages/Dashboard';
import ManagementUsers from './pages/ManagementUsers';
import MapLayout from './layout/MapLayout';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeLogin />} />
          <Route path="/main" element={<Layout />}>
            <Route path="map" element={<MapLayout />} />
            <Route path="admins" element={<ManagementAdmins />} />
            <Route path="users" element={<ManagementUsers />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StrictMode>
);