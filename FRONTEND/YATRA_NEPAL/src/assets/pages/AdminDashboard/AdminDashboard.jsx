import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.scss';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import { FaUserTie, FaSearch, FaMapMarkedAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export const AdminDashboard = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingGuide, setProcessingGuide] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3002/api/admin/pending-guides', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setGuides(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guides:', error);
      toast.error('Failed to fetch pending guides');
      setLoading(false);
    }
  };

  const handleGuideAction = async (guideId, action) => {
    try {
      setProcessingGuide(guideId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await axios.put(
        `http://localhost:3002/api/admin/guides/${guideId}/${action}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Guide ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        // Remove the guide from the list
        setGuides(guides.filter(guide => guide.user_id !== guideId));
      } else {
        toast.error('Failed to process guide application');
      }
    } catch (error) {
      console.error(`Error ${action}ing guide:`, error);
      toast.error(`Failed to ${action} guide`);
    } finally {
      setProcessingGuide(null);
    }
  };

  const handleViewDocuments = (guideId) => {
    // Navigate to guide details page
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

  const mainContent = (
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
            >
              <div className="card-header">
                <div className="guide-type-icon">
                  {getGuideTypeIcon(guide.guide_type)}
                </div>
                <div className="guide-type-label">
                  {guide.guide_type || 'General'} Guide
                </div>
              </div>
              <div className="guide-info">
                <h3>{guide.name}</h3>
                <p><FaEnvelope /> {guide.email}</p>
                <p><FaPhoneAlt /> {guide.phone_number || 'Not provided'}</p>
                <p><FaMapMarkedAlt /> {guide.nationality || 'Nationality not specified'}</p>
                <p><FaCalendarAlt /> Applied on {formatDate(guide.created_at)}</p>
              </div>
              <button 
                className="view-application-btn"
                onClick={() => handleViewDocuments(guide.user_id)}
              >
                View Application Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        {mainContent}
      </div>
    </div>
  );
};

export default AdminDashboard;