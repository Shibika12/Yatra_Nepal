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

      // Listen for notifications
      newSocket.on('new_notification', (data) => {
        console.log('Received new_notification event:', data);
        
        // Check if we're already showing this notification
        if (data.reference_id) {
          const isDuplicate = document.querySelectorAll(`[data-notification-ref="${data.reference_id}"]`).length > 0;
          if (isDuplicate) {
            console.log('Duplicate notification detected, skipping:', data);
            return;
          }
        }

        if (data.type === 'blog' && location.pathname !== '/admin/blogs') {
          setUnreadBlogs(prev => prev + 1);
        } else if (data.type === 'review' && location.pathname !== '/admin/reviews') {
          setUnreadReviews(prev => prev + 1);
        } else if (data.type === 'payment' && location.pathname !== '/admin/payments') {
          setUnreadPayments(prev => prev + 1);
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

      // Reset counts when visiting respective pages
      if (location.pathname === '/admin/payments') {
        console.log('Resetting unread payments count');
        setUnreadPayments(0);
        // Mark payment notifications as read
        markPaymentNotificationsAsRead(token);
      }

      // Clean up socket connection
      return () => {
        console.log('Cleaning up socket connection');
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [location.pathname]);

  const markPaymentNotificationsAsRead = async (token) => {
    try {
      await axios.put('http://localhost:3002/api/notifications/mark-read',
        { type: 'payment' },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Payment notifications marked as read');
    } catch (error) {
      console.error('Error marking payment notifications as read:', error);
    }
  };

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
      if (!token) {
        console.log('No token found, skipping unread payments fetch');
        return;
      }

      console.log('Fetching unread payment notifications');
      const response = await axios.get('http://localhost:3002/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Count unread payment notifications
      const unreadCount = response.data.filter(notif => {
        return notif.type === 'payment' && !notif.is_read;
      }).length;

      console.log('Setting initial unread payments count to:', unreadCount);
      setUnreadPayments(unreadCount);
    } catch (error) {
      console.error('Error fetching unread payments:', error);
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

  const handleNotificationClick = (notification) => {
    // Implement notification click handling
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
      </div>
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