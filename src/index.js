import './style/Index.css';
import HomeLogin from './pages/HomeLogin';
import Layout from './layout/Layout';
import ManagementAdmins from './pages/ManagementAdmins';
import Dashboard from './pages/Dashboard';
import ManagementUsers from './pages/ManagementUsers';
import MapLayout from './layout/MapLayout';
import { StrictMode, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LogModal from './components/modals/LogModal';
import SpaceModal from './components/modals/SpaceModal';
import { LoadingBarProvider } from './context/LoadingContextProvider';
import AppLoadingBar from './components/AppLoadingBar';
import { ToastProvider } from './context/ToastProvider';

const root = createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    <StrictMode>
      <ToastProvider>
        <LoadingBarProvider>
          <AppLoadingBar />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeLogin />} />
              <Route path="/log/kr" element={<LogModal isDirect={true} />} />
              <Route path="/log/en" element={<LogModal isDirect={true} />} />
              <Route
                path="/space/kr"
                element={<SpaceModal isDirect={true} />}
              />
              <Route
                path="/space/en"
                element={<SpaceModal isDirect={true} />}
              />
              <Route path="/main" element={<Layout />}>
                <Route path="map" element={<MapLayout />} />
                <Route path="admins" element={<ManagementAdmins />} />
                <Route path="users" element={<ManagementUsers />} />
                <Route path="dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </LoadingBarProvider>
      </ToastProvider>
    </StrictMode>
  </I18nextProvider>,
);
