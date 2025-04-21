import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './GuideNavbar.scss';
import { FaUser, FaStar, FaComments, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import io from 'socket.io-client';

const GuideNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadReviews, setUnreadReviews] = useState(0);
  const [unreadBookings, setUnreadBookings] = useState(0);

  // Helper function to get headers with token
  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    // Fetch initial unread counts
    fetchUnreadCount();
    fetchUnreadReviews();
    fetchUnreadBookings();

    // Set up socket connection for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      const socket = io('http://localhost:3002', {
        auth: { token }
      });

      // Listen for new messages
      socket.on('receive_message', () => {
        // Only increment unread count if not on messages page
        if (location.pathname !== '/guide/messages') {
          setUnreadCount(prev => prev + 1);
        }
      });

      // Listen for new notifications
      socket.on('new_notification', (notification) => {
        // Handle different types of notifications
        if (location.pathname !== '/guide/reviews' && notification.type === 'review') {
          setUnreadReviews(prev => prev + 1);
        }
        if (location.pathname !== '/guide/bookings' && 
            (notification.type === 'booking' || notification.notification_type === 'booking')) {
          console.log('Received booking notification:', notification);
          setUnreadBookings(prev => prev + 1);
        }
      });

      // Clean up socket connection
      return () => socket.disconnect();
    }
  }, [location.pathname]);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/chat/guide/conversations', {
        headers: getHeaders()
      });
      
      // Calculate total unread count from all conversations
      const totalUnreadCount = response.data.reduce((total, conversation) => {
        return total + (conversation.unread_count || 0);
      }, 0);
      
      setUnreadCount(totalUnreadCount);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  const fetchUnreadReviews = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/guides/unread-reviews-count', {
        headers: getHeaders()
      });
      setUnreadReviews(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread reviews count:', error);
    }
  };

  const fetchUnreadBookings = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/guides/unread-bookings-count', {
        headers: getHeaders()
      });
      setUnreadBookings(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread bookings count:', error);
    }
  };

  // Reset unread reviews count when visiting reviews page
  useEffect(() => {
    if (location.pathname === '/guide/reviews' && unreadReviews > 0) {
      setUnreadReviews(0);
      // Mark reviews as read in backend
      const token = localStorage.getItem('token');
      axios.post('http://localhost:3002/api/guides/mark-reviews-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error('Error marking reviews as read:', error);
      });
    }
  }, [location.pathname, unreadReviews]);

  // Reset unread messages count when visiting messages page
  useEffect(() => {
    if (location.pathname === '/guide/messages' && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [location.pathname, unreadCount]);

  // Reset unread bookings count when visiting bookings page
  useEffect(() => {
    if (location.pathname === '/guide/bookings' && unreadBookings > 0) {
      setUnreadBookings(0);
      // Mark bookings as read in backend
      const token = localStorage.getItem('token');
      axios.post('http://localhost:3002/api/guides/mark-bookings-read', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error('Error marking bookings as read:', error);
      });
    }
  }, [location.pathname, unreadBookings]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
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
    <div className="guide-navbar">
      <div className="logo">
        <h2>Guide Dashboard</h2>
      </div>
      
      <nav>
        <Link to="/guide/dashboard" className={isActive('/guide/dashboard')}>
          <FaUser /> Profile
        </Link>
        <Link to="/guide/reviews" className={isActive('/guide/reviews')}>
          <FaStar /> Reviews
          {unreadReviews > 0 && <span className="notification-badge">{unreadReviews}</span>}
        </Link>
        <Link to="/guide/messages" className={isActive('/guide/messages')}>
          <FaComments /> Messages
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </Link>
        <Link to="/guide/bookings" className={isActive('/guide/bookings')}>
          <FaCalendarAlt /> Bookings
          {unreadBookings > 0 && <span className="notification-badge">{unreadBookings}</span>}
        </Link>
        
        <button onClick={handleLogoutClick} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
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

export default GuideNavbar; 