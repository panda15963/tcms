import i18n from './i18n';
import './style/Index.css';
import HomeLogin from './pages/HomeLogin';
import Layout from './layout/Layout';
import DashboardLayout from './layout/DashboardLayout';
import ManagementUsers from './pages/ManagementUsers';
import MapLayout from './layout/MapLayout';
import LogModal from './components/modals/LogModal';
import SpaceModal from './components/modals/SpaceModal';
import AppLoadingBar from './components/AppLoadingBar';
import Configuration from './pages/statisticsPages/Configuration';
import CountsByTool from './pages/statisticsPages/CountsByTool';
import CountsByVersion from './pages/statisticsPages/CountsByVersion';
import Logs from './pages/statisticsPages/Logs';
import RealTime from './pages/statisticsPages/RealTime';
import UsageCounts from './pages/statisticsPages/UsageCounts';
import UsageStatus from './pages/statisticsPages/UsageStatus';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { LoadingBarProvider } from './context/LoadingContextProvider';
import { ToastProvider } from './context/ToastProvider';
import { SelectedItemProvider } from './context/SelectedItemContext';
import ManagementAdmins from './pages/admins/ManagementAdmins';

const root = createRoot(document.getElementById('root'));
root.render(
  <I18nextProvider i18n={i18n}>
    {/* <StrictMode> */}
    <ToastProvider>
      <SelectedItemProvider>
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
                <Route path="dashboard" element={<DashboardLayout />}>
                  <Route path="configuration" element={<Configuration />} />
                  <Route path="countsByTool" element={<CountsByTool />} />
                  <Route path="countsByVersion" element={<CountsByVersion />} />
                  <Route path="logs" element={<Logs />} />
                  <Route path="realTimeStatus" element={<RealTime />} />
                  <Route path="realTimeUsageInfo" element={<UsageStatus />} />
                  <Route
                    path="usageFunctionCounts"
                    element={<UsageCounts />}
                    UsageCounts
                  />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </LoadingBarProvider>
      </SelectedItemProvider>
    </ToastProvider>
    {/* </StrictMode> */}
  </I18nextProvider>
);
