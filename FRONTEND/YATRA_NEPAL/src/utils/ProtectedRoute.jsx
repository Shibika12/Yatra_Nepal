import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginPrompt from '../assets/components/LoginPrompt/LoginPrompt';

const ProtectedRoute = ({ children }) => {
  const [showPrompt, setShowPrompt] = useState(true);
  
  // Check if user is logged in (you'll need to implement this based on your auth system)
  const isAuthenticated = localStorage.getItem('token'); // Or however you store auth state
  
  if (!isAuthenticated) {
    if (showPrompt) {
      return <LoginPrompt onClose={() => setShowPrompt(false)} />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 