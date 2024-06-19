import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Map from './components/pages/map';
import Login from './components/pages/homeLogin';
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/components/map" element={<Map />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
