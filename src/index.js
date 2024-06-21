import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/pages/homeLogin';
import './index.css';
import Layout from './layout/Layout';
import ManagementAdmins from './pages/ManagementAdmins';
import Dashboard from './pages/Dashboard';
import ManagementUsers from './pages/ManagementUsers';
import TMap from './pages/TMap';
import GoogleMap from './pages/GoogleMap';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Layout />}>
          <Route index element={<GoogleMap />} />
          <Route path="/main/tmap" element={<TMap />} />
          <Route path="/main/admins" element={<ManagementAdmins />} />
          <Route path="/main/users" element={<ManagementUsers />} />
          <Route path="/main/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
