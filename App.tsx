import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmailGate from './components/EmailGate';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

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

        <Route
          path="/app"
          element={
            <div style={{
              minHeight: '100vh',
              background: '#000',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h1 style={{ fontSize: '48px', color: '#00d4ff' }}>🚧 AI Studio Coming Soon</h1>
              <p style={{ color: '#888' }}>The DeepFish AI Studio is under construction</p>
              <a href="/" style={{ color: '#00d4ff', textDecoration: 'none' }}>← Back to Home</a>
            </div>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
