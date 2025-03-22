import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPrompt from '../LoginPrompt/LoginPrompt';

const GuideCard = ({ guide }) => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token'); // Or however you check auth

  const handleGuideClick = () => {
    if (isAuthenticated) {
      navigate(`/guide/${guide.id}`);
    } else {
      setShowLoginPrompt(true);
    }
  };

  return (
    <>
      <div className="guide-card" onClick={handleGuideClick}>
        {/* ... existing guide card content ... */}
      </div>
      
      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </>
  );
};

export default GuideCard; 