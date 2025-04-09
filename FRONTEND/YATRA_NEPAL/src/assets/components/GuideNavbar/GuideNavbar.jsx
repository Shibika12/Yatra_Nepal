import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './GuideNavbar.scss';
import { FaUser, FaStar, FaComments, FaSignOutAlt } from 'react-icons/fa';
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

      // Listen for new reviews
      socket.on('new_review', () => {
        // Only increment unread reviews if not on reviews page
        if (location.pathname !== '/guide/reviews') {
          setUnreadReviews(prev => prev + 1);
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/guides/unread-reviews-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUnreadReviews(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread reviews count:', error);
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