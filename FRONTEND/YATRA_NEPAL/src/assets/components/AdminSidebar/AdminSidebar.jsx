import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.scss';
import { FaUsers, FaBlog, FaStar, FaUserCheck, FaSignOutAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      <nav className="sidebar-nav">
        <Link to="/admin/dashboard" className={`nav-item ${isActive('/admin/dashboard')}`}>
          <FaUserCheck />
          <span>Pending Guides</span>
        </Link>
        <Link to="/admin/users" className={`nav-item ${isActive('/admin/users')}`}>
          <FaUsers />
          <span>Users</span>
        </Link>
        <Link to="/admin/blogs" className={`nav-item ${isActive('/admin/blogs')}`}>
          <FaBlog />
          <span>Blogs</span>
        </Link>
        <Link to="/admin/reviews" className={`nav-item ${isActive('/admin/reviews')}`}>
          <FaStar />
          <span>Guide Reviews</span>
        </Link>
        <button onClick={handleLogout} className="nav-item logout-btn">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar; 