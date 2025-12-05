
import React, { useState, useEffect } from 'react';
import EmailGate from './components/EmailGate';
import LandingPage from './components/LandingPage';

// Lazy load the original AI Studio components only when needed
// This prevents the Google Gemini API key error on initial page load
const LazyOriginalApp = React.lazy(() => import('./OriginalApp'));


const App: React.FC = () => {
  // Check if user has submitted email
  const [hasSubmittedEmail, setHasSubmittedEmail] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const submitted = localStorage.getItem('deepfish_email_submitted');
    if (submitted === 'true') {
      setHasSubmittedEmail(true);
    }
  }, []);

  const handleEmailSuccess = () => {
    setHasSubmittedEmail(true);
  };

  // If they haven't submitted email, show the email gate
  if (!hasSubmittedEmail) {
    return <EmailGate onSuccess={handleEmailSuccess} />;
  }

  // After email submission, show the landing page
  return <LandingPage />;
};

export default App;
