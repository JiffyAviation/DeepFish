import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmailGate from './components/EmailGate';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import AIStudio from './components/AIStudio';
import Sitemap from './components/Sitemap';

function App() {
  const [showEmailGate, setShowEmailGate] = useState(true);

  useEffect(() => {
    const emailSubmitted = localStorage.getItem('deepfish_email_submitted');
    if (emailSubmitted === 'true') {
      setShowEmailGate(false);
    }
  }, []);

  const handleEmailSubmit = () => {
    setShowEmailGate(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            showEmailGate ? (
              <EmailGate onEmailSubmit={handleEmailSubmit} />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/app" element={<AIStudio />} />
        <Route path="/sitemap" element={<Sitemap />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
