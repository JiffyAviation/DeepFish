import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './src/modules/Landing/Landing';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import AIStudio from './components/AIStudio';
import Sitemap from './components/Sitemap';
import Settings from './components/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* New Modular Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Core Application - Wrapped in ErrorBoundary */}
          <Route
            path="/app"
            element={
              <ErrorBoundary>
                <AIStudio />
              </ErrorBoundary>
            }
          />

          {/* Admin & Utilities */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/settings"
            element={
              <ErrorBoundary>
                <Settings />
              </ErrorBoundary>
            }
          />
          <Route path="/sitemap" element={<Sitemap />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
