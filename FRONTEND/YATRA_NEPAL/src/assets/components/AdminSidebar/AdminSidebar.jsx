import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.scss';
import { FaUsers, FaBlog, FaStar, FaUserCheck, FaSignOutAlt, FaTachometerAlt, FaCog } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/login');
    setShowLogoutModal(false);
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
        <Link to="/admin/overview" className={`nav-item ${isActive('/admin/overview')}`}>
          <FaTachometerAlt />
          <span>Dashboard</span>
        </Link>
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
        <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings')}`}>
          <FaCog />
          <span>Settings</span>
        </Link>
        <button onClick={handleLogoutClick} className="nav-item logout-btn">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </nav>
      {/* Logout Confirmation Modal */}
      <Modal 
        show={showLogoutModal} 
        onHide={handleLogoutCancel}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleLogoutCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLogoutConfirm}>
            Confirm Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSidebar; 