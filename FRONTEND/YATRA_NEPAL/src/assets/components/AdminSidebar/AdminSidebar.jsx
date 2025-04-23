import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.scss';
import { FaUsers, FaBlog, FaStar, FaUserCheck, FaSignOutAlt, FaTachometerAlt, FaCog, FaMoneyBill } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import io from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadBlogs, setUnreadBlogs] = useState(0);
  const [unreadReviews, setUnreadReviews] = useState(0);
  const [pendingGuides, setPendingGuides] = useState(0);
  const [unreadPayments, setUnreadPayments] = useState(0);

  // Function to mark items as read
  const markItemsAsRead = async (type) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:3002/api/admin/mark-${type}-read`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.error(`Error marking ${type} as read:`, error);
    }
  };

  // Effect to handle page visits and mark items as read
  useEffect(() => {
    if (location.pathname === '/admin/blogs') {
      markItemsAsRead('blogs');
      setUnreadBlogs(0);
    } else if (location.pathname === '/admin/reviews') {
      markItemsAsRead('reviews');
      setUnreadReviews(0);
    } else if (location.pathname === '/admin/payments') {
      markItemsAsRead('payments');
      setUnreadPayments(0);
    }
  }, [location.pathname]);

  // Effect to fetch initial counts and set up socket listeners
  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        // Fetch unread blogs count
        const blogsResponse = await axios.get('http://localhost:3002/api/admin/unread-blogs-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUnreadBlogs(blogsResponse.data.count || 0);

        // Fetch unread reviews count
        const reviewsResponse = await axios.get('http://localhost:3002/api/admin/unread-reviews-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUnreadReviews(reviewsResponse.data.count || 0);

        // Fetch pending guides count
        const guidesResponse = await axios.get('http://localhost:3002/api/admin/pending-guides-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPendingGuides(guidesResponse.data.count || 0);

        // Fetch unread payments count
        const paymentsResponse = await axios.get('http://localhost:3002/api/admin/unread-payments-count', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUnreadPayments(paymentsResponse.data.count || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();

    // Set up socket connection for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      const socket = io('http://localhost:3002', {
        auth: { token }
      });

      socket.on('new_blog_added', () => {
        if (location.pathname !== '/admin/blogs') {
          setUnreadBlogs(prev => prev + 1);
        }
      });

      socket.on('new_review_added', () => {
        if (location.pathname !== '/admin/reviews') {
          setUnreadReviews(prev => prev + 1);
        }
      });

      socket.on('new_payment_added', () => {
        if (location.pathname !== '/admin/payments') {
          setUnreadPayments(prev => prev + 1);
        }
      });

      socket.on('new_guide_application', () => {
        if (location.pathname !== '/admin/pending-guides') {
          setPendingGuides(prev => prev + 1);
        }
      });

      return () => socket.disconnect();
    }
  }, []);

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
    if (path === '/admin/overview') {
      // For dashboard, only be active if there's no section parameter
      return location.pathname === path && !location.search ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  const handleNotificationClick = (notification) => {
    // Implement notification click handling
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="admin-sidebar">
      <Link to="/admin/overview" className={`sidebar-item ${isActive('/admin/overview') ? 'active' : ''}`}>
        <FaTachometerAlt /> Dashboard
      </Link>
      <Link to="/admin/users" className={`sidebar-item ${isActive('/admin/users') ? 'active' : ''}`}>
        <FaUsers /> Users
      </Link>
      <Link to="/admin/pending-guides" className={`sidebar-item ${isActive('/admin/pending-guides') ? 'active' : ''}`}>
        <FaUserCheck /> Pending Guides
        {pendingGuides > 0 && <span className="notification-badge">{pendingGuides}</span>}
      </Link>
      <Link to="/admin/blogs" className={`sidebar-item ${isActive('/admin/blogs') ? 'active' : ''}`}>
        <FaBlog /> Blogs
        {unreadBlogs > 0 && <span className="notification-badge">{unreadBlogs}</span>}
      </Link>
      <Link to="/admin/reviews" className={`sidebar-item ${isActive('/admin/reviews') ? 'active' : ''}`}>
        <FaStar /> Reviews
        {unreadReviews > 0 && <span className="notification-badge">{unreadReviews}</span>}
      </Link>
      <Link to="/admin/payments" className={`sidebar-item ${isActive('/admin/payments') ? 'active' : ''}`}>
        <FaMoneyBill /> Payments
        {unreadPayments > 0 && <span className="notification-badge">{unreadPayments}</span>}
      </Link>
      <div className="sidebar-item" onClick={handleLogoutClick}>
        <FaSignOutAlt /> Logout
      </div>
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