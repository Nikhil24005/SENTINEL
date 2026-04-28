import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IncidentPage from './pages/IncidentPage';
import ResponderPage from './pages/ResponderPage';
import DrillsPage from './pages/DrillsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents/:id" element={<IncidentPage />} />
        <Route path="/responder" element={<ResponderPage />} />
        <Route path="/drills" element={<DrillsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/help/:zoneId" element={<HelpPage />} />
      </Routes>
    </Router>
  );
}

export default App;
