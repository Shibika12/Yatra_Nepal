import React from 'react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminOverview.scss';
import { FaUsers, FaUserTie, FaBlog, FaStar } from 'react-icons/fa';

const AdminOverview = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="overview-container">
          <h1>Dashboard Overview</h1>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p>250</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaUserTie />
              </div>
              <div className="stat-info">
                <h3>Active Guides</h3>
                <p>45</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaBlog />
              </div>
              <div className="stat-info">
                <h3>Total Blogs</h3>
                <p>128</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-info">
                <h3>Reviews</h3>
                <p>320</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview; 