import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.scss';
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar';

export const AdminDashboard = () => {
  const [pendingGuides, setPendingGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingGuides();
  }, []);

  const fetchPendingGuides = async () => {
    try {
      const response = await axios.get('http://localhost:3002/admin/pending-guides');
      setPendingGuides(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending guides:', error);
      setLoading(false);
    }
  };

  const handleApproval = async (guideId, status) => {
    try {
      await axios.post(`http://localhost:3002/admin/guide-approval`, {
        guideId,
        status
      });
      
      // Refresh the list after approval/rejection
      fetchPendingGuides();
      alert(`Guide ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating guide status:', error);
      alert('Error updating guide status');
    }
  };

  const viewDocument = (documentUrl) => {
    window.open(documentUrl, '_blank');
  };

  return (
    <>
      <AdminNavbar />
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <div className="guide-validation-section">
          <h2>Pending Guide Validations</h2>
          {loading ? (
            <p>Loading...</p>
          ) : pendingGuides.length === 0 ? (
            <p>No pending guide validations</p>
          ) : (
            <div className="guides-grid">
              {pendingGuides.map((guide) => (
                <div key={guide.user_id} className="guide-card">
                  <div className="guide-info">
                    <h3>{guide.name}</h3>
                    <p>Email: {guide.email}</p>
                    <p>Phone: {guide.phone_number}</p>
                    <p>Guide Type: {guide.guide_type}</p>
                    <p>Experience: {guide.years_of_experience} years</p>
                  </div>
                  
                  <div className="document-section">
                    <button 
                      onClick={() => viewDocument(guide.citizenship_document)}
                      className="doc-button"
                    >
                      View Citizenship Document
                    </button>
                    <button 
                      onClick={() => viewDocument(guide.guide_license)}
                      className="doc-button"
                    >
                      View Guide License
                    </button>
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={() => handleApproval(guide.user_id, 'approved')}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApproval(guide.user_id, 'rejected')}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard; 