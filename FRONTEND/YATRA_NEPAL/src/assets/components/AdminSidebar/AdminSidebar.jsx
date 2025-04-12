import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.scss';
import { FaUsers, FaBlog, FaStar, FaUserCheck, FaSignOutAlt, FaTachometerAlt, FaCog, FaMoneyBill } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import io from 'socket.io-client';
import axios from 'axios';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadBlogs, setUnreadBlogs] = useState(0);
  const [unreadReviews, setUnreadReviews] = useState(0);
  const [pendingGuides, setPendingGuides] = useState(0);
  const [unreadPayments, setUnreadPayments] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Get user data including ID
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    console.log('Current user data:', user);

    if (!user || !user.user_id) {
      console.error('No user data or user ID found');
      return;
    }

    // Fetch initial unread counts
    fetchUnreadBlogs();
    fetchUnreadReviews();
    fetchPendingGuides();
    fetchUnreadPayments();

    // Set up socket connection
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Setting up socket connection for admin...');
      const newSocket = io('http://localhost:3002', {
        auth: { token }
      });

      // Store socket in state
      setSocket(newSocket);

      // Join admin room
      newSocket.emit('join_admin', { userId: user.user_id });
      console.log('Emitted join_admin event with userId:', user.user_id);

      // Listen for new blog notifications
      newSocket.on('new_blog', (data) => {
        console.log('Received new_blog event:', data);
        console.log('Current pathname:', location.pathname);
        if (location.pathname !== '/admin/blogs') {
          console.log('Incrementing unread blogs count');
          setUnreadBlogs(prev => {
            const newCount = prev + 1;
            console.log('New unread blogs count:', newCount);
            return newCount;
          });
        }
      });

      // Listen for new review notifications
      newSocket.on('new_review', (data) => {
        console.log('Received new_review event:', data);
        console.log('Current pathname:', location.pathname);
        if (location.pathname !== '/admin/reviews') {
          console.log('Incrementing unread reviews count');
          setUnreadReviews(prev => {
            const newCount = prev + 1;
            console.log('New unread reviews count:', newCount);
            return newCount;
          });
        }
      });

      // Listen for new guide validation submissions
      newSocket.on('new_guide_validation', (data) => {
        console.log('Received new_guide_validation event:', data);
        console.log('Current pathname:', location.pathname);
        if (location.pathname !== '/admin/dashboard') {
          console.log('Incrementing pending guides count');
          setPendingGuides(prev => {
            const newCount = prev + 1;
            console.log('New pending guides count:', newCount);
            return newCount;
          });
        }
      });

      // Listen for new payment notifications
      newSocket.on('new_payment', (data) => {
        console.log('Received new_payment event:', data);
        console.log('Current pathname:', location.pathname);
        if (location.pathname !== '/admin/payments') {
          console.log('Incrementing unread payments count');
          setUnreadPayments(prev => {
            const newCount = prev + 1;
            console.log('New unread payments count:', newCount);
            return newCount;
          });
        }
      });

      // Listen for new notifications
      newSocket.on('new_notification', (data) => {
        console.log('Received new_notification event:', data);
        if (data.type === 'blog' && location.pathname !== '/admin/blogs') {
          console.log('Incrementing unread blogs count for notification');
          setUnreadBlogs(prev => {
            const newCount = prev + 1;
            console.log('New unread blogs count:', newCount);
            return newCount;
          });
        } else if (data.type === 'review' && location.pathname !== '/admin/reviews') {
          console.log('Incrementing unread reviews count for notification');
          setUnreadReviews(prev => {
            const newCount = prev + 1;
            console.log('New unread reviews count:', newCount);
            return newCount;
          });
        } else if (data.type === 'guide_validation' && location.pathname !== '/admin/dashboard') {
          console.log('Incrementing pending guides count for notification');
          setPendingGuides(prev => {
            const newCount = prev + 1;
            console.log('New pending guides count:', newCount);
            return newCount;
          });
        } else if (data.type === 'payment' && location.pathname !== '/admin/payments') {
          console.log('Incrementing unread payments count for notification');
          setUnreadPayments(prev => {
            const newCount = prev + 1;
            console.log('New unread payments count:', newCount);
            return newCount;
          });
        }
      });

      // Socket connection events
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        // Fetch notifications again after successful connection
        fetchUnreadBlogs();
        fetchUnreadReviews();
        fetchPendingGuides();
        fetchUnreadPayments();
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Clean up socket connection
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    }
  }, [location.pathname]);

  const fetchUnreadBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!token || !user || !user.user_id) {
        console.log('No token or user data found, skipping unread blogs fetch');
        return;
      }

      console.log('Fetching unread blog notifications for user:', user.user_id);
      const response = await axios.get('http://localhost:3002/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw notifications response:', response.data);
      
      // Count unread blog notifications
      const unreadCount = response.data.filter(notif => {
        console.log('Checking notification:', notif);
        const isUnreadBlog = notif.type === 'blog' && !notif.is_read;
        console.log('Is unread blog:', isUnreadBlog);
        return isUnreadBlog;
      }).length;

      console.log('Final unread blog notifications count:', unreadCount);
      setUnreadBlogs(unreadCount);
    } catch (error) {
      console.error('Error fetching unread blogs:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const fetchUnreadReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!token || !user || !user.user_id) {
        console.log('No token or user data found, skipping unread reviews fetch');
        return;
      }

      console.log('Fetching unread review notifications for user:', user.user_id);
      const response = await axios.get('http://localhost:3002/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw notifications response:', response.data);
      
      // Count unread review notifications
      const unreadCount = response.data.filter(notif => {
        console.log('Checking notification:', notif);
        const isUnreadReview = notif.type === 'review' && !notif.is_read;
        console.log('Is unread review:', isUnreadReview);
        return isUnreadReview;
      }).length;

      console.log('Final unread review notifications count:', unreadCount);
      setUnreadReviews(unreadCount);
    } catch (error) {
      console.error('Error fetching unread reviews:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const fetchPendingGuides = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!token || !user || !user.user_id) {
        console.log('No token or user data found, skipping pending guides fetch');
        return;
      }

      console.log('Fetching pending guides count for user:', user.user_id);
      const response = await axios.get('http://localhost:3002/api/admin/pending-guides-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Pending guides count response:', response.data);
      setPendingGuides(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching pending guides count:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  const fetchUnreadPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!token || !user || !user.user_id) {
        console.log('No token or user data found, skipping unread payments fetch');
        return;
      }

      console.log('Fetching unread payment notifications for user:', user.user_id);
      const response = await axios.get('http://localhost:3002/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw notifications response:', response.data);
      
      // Count unread payment notifications
      const unreadCount = response.data.filter(notif => {
        console.log('Checking notification:', notif);
        const isUnreadPayment = notif.type === 'payment' && !notif.is_read;
        console.log('Is unread payment:', isUnreadPayment);
        return isUnreadPayment;
      }).length;

      console.log('Final unread payment notifications count:', unreadCount);
      setUnreadPayments(unreadCount);
    } catch (error) {
      console.error('Error fetching unread payments:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

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
          {pendingGuides > 0 && (
            <span className="notification-badge">{pendingGuides}</span>
          )}
        </Link>
        <Link to="/admin/users" className={`nav-item ${isActive('/admin/users')}`}>
          <FaUsers />
          <span>Users</span>
        </Link>
        <Link to="/admin/blogs" className={`nav-item ${isActive('/admin/blogs')}`}>
          <FaBlog />
          <span>Blogs</span>
          {unreadBlogs > 0 && (
            <span className="notification-badge">{unreadBlogs}</span>
          )}
        </Link>
        <Link to="/admin/reviews" className={`nav-item ${isActive('/admin/reviews')}`}>
          <FaStar />
          <span>Guide Reviews</span>
          {unreadReviews > 0 && (
            <span className="notification-badge">{unreadReviews}</span>
          )}
        </Link>
        <Link to="/admin/payments" className={`nav-item ${isActive('/admin/payments')}`}>
          <FaMoneyBill />
          <span>Payments</span>
          {unreadPayments > 0 && (
            <span className="notification-badge">{unreadPayments}</span>
          )}
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