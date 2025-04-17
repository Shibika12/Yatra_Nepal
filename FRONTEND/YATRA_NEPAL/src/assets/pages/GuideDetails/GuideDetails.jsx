import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './GuideDetails.scss';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaFileAlt, FaGlobe, FaCalendarAlt } from 'react-icons/fa';

const GuideDetails = () => {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuideDetails = async () => {
      try {
        console.log('Fetching details for guide ID:', guideId);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:3002/api/admin/pending-guides/${guideId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Guide details:', response.data);
        setGuide(response.data);
      } catch (error) {
        console.error('Error fetching guide details:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (guideId) {
      fetchGuideDetails();
    }
  }, [guideId]);

  const handleApproval = async (status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        alert('Authentication error. Please log in again.');
        return;
      }

      await axios.post(`http://localhost:3002/api/admin/guide-approval`, {
        guideId,
        status
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert(`Guide ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating guide status:', error);
      alert('Error updating guide status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const viewDocument = (documentPath) => {
    window.open(`http://localhost:3002/${documentPath}`, '_blank');
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="guide-details-page">
        <div className="loading">Loading...</div>
      </div>
    </div>
  );

  if (!guide) return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="guide-details-page">
        <div className="error">Guide not found (ID: {guideId})</div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="guide-details-page">
        <div className="guide-details-container">
          <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </button>
          
          <div className="guide-header">
            <h1>Guide Application Details</h1>
            <div className="status-badge pending">Pending Approval</div>
          </div>

          <div className="guide-info-card">
            <div className="info-section">
              <div className="info-item">
                <FaUser className="icon" />
                <div className="info-content">
                  <label>Name</label>
                  <p>{guide.name}</p>
                </div>
              </div>
              <div className="info-item">
                <FaEnvelope className="icon" />
                <div className="info-content">
                  <label>Email</label>
                  <p>{guide.email}</p>
                </div>
              </div>
              <div className="info-item">
                <FaPhone className="icon" />
                <div className="info-content">
                  <label>Phone</label>
                  <p>{guide.phone_number}</p>
                </div>
              </div>
              <div className="info-item">
                <FaIdCard className="icon" />
                <div className="info-content">
                  <label>Guide Type</label>
                  <p>{guide.guide_type}</p>
                </div>
              </div>
              <div className="info-item">
                <FaGlobe className="icon" />
                <div className="info-content">
                  <label>Nationality</label>
                  <p>{guide.nationality || 'Not specified'}</p>
                </div>
              </div>
              <div className="info-item">
                <FaCalendarAlt className="icon" />
                <div className="info-content">
                  <label>Applied On</label>
                  <p>{formatDate(guide.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {guide.documents && guide.documents.length > 0 && (
            <div className="documents-section">
              <h2>Submitted Documents</h2>
              <div className="documents-grid">
                {guide.documents.map((doc, index) => (
                  <div key={index} className="document-card">
                    <FaFileAlt className="doc-icon" />
                    <h3>{doc.type}</h3>
                    <button onClick={() => viewDocument(doc.path)}>
                      View Document
                    </button>
                    <p className="status">Status: {doc.status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button className="approve-btn" onClick={() => handleApproval('approved')}>
              Approve Guide
            </button>
            <button className="reject-btn" onClick={() => handleApproval('rejected')}>
              Reject Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetails; 