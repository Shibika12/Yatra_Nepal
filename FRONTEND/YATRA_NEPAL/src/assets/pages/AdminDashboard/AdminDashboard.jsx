import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.scss';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';

export const AdminDashboard = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await axios.get('http://localhost:3002/admin/pending-guides');
      setGuides(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setLoading(false);
    }
  };

  const handleGuideClick = (guideId) => {
    navigate(`/admin/guide/${guideId}`);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-dashboard">
          <h1>Pending Guide Applications</h1>
          
          {loading ? (
            <div className="loading">Loading...</div>
          ) : guides.length === 0 ? (
            <div className="no-guides">No pending guide applications</div>
          ) : (
            <div className="guides-list">
              {guides.map(guide => (
                <div 
                  key={guide.user_id} 
                  className="guide-item"
                  onClick={() => handleGuideClick(guide.user_id)}
                >
                  <div className="guide-info-preview">
                    <h3>{guide.name}</h3>
                    <p>Email: {guide.email}</p>
                    <p>Phone: {guide.phone_number}</p>
                    <p>Guide Type: {guide.guide_type}</p>
                    <span className="status pending">
                      Pending Approval
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;