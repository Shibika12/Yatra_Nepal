import React from 'react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminBlogs.scss';
import { FaBlog } from 'react-icons/fa';

const AdminBlogs = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="blogs-coming-soon">
          <div className="coming-soon-content">
            <FaBlog className="blog-icon" />
            <h1>Blog Management Coming Soon</h1>
            <p>We're working on an amazing blog management system for Yatra Nepal.</p>
            <div className="features-preview">
              <h3>Upcoming Features:</h3>
              <ul>
                <li>Blog post moderation</li>
                <li>Content management</li>
                <li>User engagement analytics</li>
                <li>Travel story highlights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs; 