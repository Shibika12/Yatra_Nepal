import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginPrompt from '../assets/components/LoginPrompt/LoginPrompt';

const AuthRoute = ({ children }) => {
  const [showPrompt, setShowPrompt] = useState(true);
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    if (showPrompt) {
      return <LoginPrompt onClose={() => setShowPrompt(false)} />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

export default AuthRoute; 