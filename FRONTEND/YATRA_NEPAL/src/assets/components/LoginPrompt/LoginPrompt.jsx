import React from 'react';
import './LoginPrompt.scss';
import { useNavigate } from 'react-router-dom';

const LoginPrompt = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="login-prompt-overlay">
      <div className="login-prompt">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Please Login First</h2>
        <p>You need to be logged in to access this feature.</p>
        <div className="prompt-buttons">
          <button onClick={() => navigate('/login')} className="login-btn">
            Login
          </button>
          <button onClick={() => navigate('/signup')} className="signup-btn">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt; 