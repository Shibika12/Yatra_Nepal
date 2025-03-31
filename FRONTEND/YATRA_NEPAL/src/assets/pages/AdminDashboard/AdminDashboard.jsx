import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.scss';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import { FaUserTie, FaSearch, FaMapMarkedAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

export const AdminDashboard = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/admin/pending-guides');
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

  const filteredGuides = guides.filter(guide =>
    guide.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.guide_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGuideTypeIcon = (guideType) => {
    switch(guideType?.toLowerCase()) {
      case 'trekking':
        return '🏔️';
      case 'cultural':
        return '🏛️';
      case 'adventure':
        return '🏃';
      case 'nature':
        return '🌿';
      default:
        return '🗺️';
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="pending-guides-dashboard">
          <div className="dashboard-header">
            <div className="header-content">
              <h1>
                <FaUserTie className="header-icon" />
                Pending Guide Applications
              </h1>
              <p>Review and approve new guide applications for Yatra Nepal</p>
            </div>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search guides by name, email, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading guide applications...</p>
            </div>
          ) : filteredGuides.length === 0 ? (
            <div className="empty-state">
              <FaUserTie size={48} />
              <h3>No Pending Applications</h3>
              <p>There are no guide applications waiting for review</p>
            </div>
          ) : (
            <div className="guides-grid">
              {filteredGuides.map(guide => (
                <div 
                  key={guide.user_id} 
                  className="guide-card"
                  onClick={() => handleGuideClick(guide.user_id)}
                >
                  <div className="guide-card-header">
                    <div className="guide-avatar">
                      {getGuideTypeIcon(guide.guide_type)}
                    </div>
                    <div className="guide-type-badge">
                      {guide.guide_type} Guide
                    </div>
                  </div>

                  <div className="guide-info">
                    <h3>{guide.name}</h3>
                    
                    <div className="info-item">
                      <FaEnvelope className="info-icon" />
                      <span>{guide.email}</span>
                    </div>
                    
                    <div className="info-item">
                      <FaPhoneAlt className="info-icon" />
                      <span>{guide.phone_number}</span>
                    </div>

                    <div className="info-item">
                      <FaMapMarkedAlt className="info-icon" />
                      <span>{guide.nationality || 'Nationality not specified'}</span>
                    </div>

                    <div className="info-item">
                      <FaCalendarAlt className="info-icon" />
                      <span>Applied on {formatDate(guide.created_at)}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <button className="view-details-btn">
                      View Application Details
                    </button>
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