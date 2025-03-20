import React from 'react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminReviews.scss';
import { FaStar, FaCompass, FaUserCheck, FaChartLine } from 'react-icons/fa';

const AdminReviews = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="reviews-coming-soon">
          <div className="coming-soon-content">
            <div className="icon-container">
              <FaStar className="review-icon" />
            </div>
            <h1>Guide Reviews Management Coming Soon</h1>
            <p>We're developing a comprehensive review management system to ensure quality guide services for Yatra Nepal.</p>
            
            <div className="features-grid">
              <div className="feature-card">
                <FaUserCheck className="feature-icon" />
                <h3>Review Verification</h3>
                <p>Authenticate and validate tourist reviews for genuine feedback</p>
              </div>

              <div className="feature-card">
                <FaStar className="feature-icon" />
                <h3>Rating System</h3>
                <p>Detailed rating metrics for guide performance evaluation</p>
              </div>

              <div className="feature-card">
                <FaCompass className="feature-icon" />
                <h3>Guide Insights</h3>
                <p>Comprehensive guide performance and tourist satisfaction tracking</p>
              </div>

              <div className="feature-card">
                <FaChartLine className="feature-icon" />
                <h3>Analytics Dashboard</h3>
                <p>Detailed analytics for guide service improvement</p>
              </div>
            </div>

            <div className="timeline">
              <h3>Development Timeline</h3>
              <div className="timeline-items">
                <div className="timeline-item">
                  <span className="dot"></span>
                  <div className="content">
                    <h4>Phase 1: Review System Setup</h4>
                    <p>Basic review functionality and management interface</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <span className="dot"></span>
                  <div className="content">
                    <h4>Phase 2: Analytics Integration</h4>
                    <p>Advanced metrics and reporting features</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <span className="dot"></span>
                  <div className="content">
                    <h4>Phase 3: Complete Launch</h4>
                    <p>Full feature rollout with all planned functionalities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews; 