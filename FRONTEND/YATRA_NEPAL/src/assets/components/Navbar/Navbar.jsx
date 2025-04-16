import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import LoginPrompt from '../LoginPrompt/LoginPrompt';
import axios from 'axios';
import io from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Navbar.scss";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      setUser(parsedUserData);
      
      // Ensure userRole is stored correctly
      if (parsedUserData.role) {
        console.log('Setting userRole to:', parsedUserData.role);
        localStorage.setItem('userRole', parsedUserData.role);
      } else if (parsedUserData.user_type) {
        console.log('Setting userRole to:', parsedUserData.user_type);
        localStorage.setItem('userRole', parsedUserData.user_type);
      }
      
      fetchNotifications();
      initializeSocket();
    }

    // Close notifications dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    console.log('Token for socket initialization:', token ? 'Present' : 'Missing');
    if (!token || !userData) {
      console.log('Missing token or user data, skipping socket initialization');
      return;
    }

    const user = JSON.parse(userData);
    console.log('Initializing socket with user:', user);

    try {
      // Ensure token is in the correct format (remove 'Bearer ' if present)
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
      
      socketRef.current = io('http://localhost:3002', {
        auth: { 
          token: cleanToken,
          userId: user.user_id || user.userId,
          userType: user.role || user.user_type || 'Tourist'
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully');
        // Join user-specific room
        socketRef.current.emit('join_room', `tourist_${user.user_id || user.userId}`);
        // Fetch notifications again after successful connection
        fetchNotifications();
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Try to reconnect after a delay
        setTimeout(() => {
          console.log('Attempting to reconnect socket...');
          socketRef.current.connect();
        }, 5000);
      });

      socketRef.current.on('receive_message', (message) => {
        console.log('Received message:', message);
        // Fetch latest notifications when a message is received
        fetchNotifications();
      });

      socketRef.current.on('new_notification', (notification) => {
        console.log('Received new notification:', notification);
        
        // Show toast notification
        if (notification.type === 'payment') {
          toast.success(notification.content, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#4CAF50',
              color: '#fff',
            },
          });
        } else {
          toast.success(notification.content);
        }
        
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === notification.id);
          if (exists) {
            return prev;
          }
          return [notification, ...prev];
        });
        setUnreadCount(prev => prev + 1);
      });

      // Handle payment confirmation event
      socketRef.current.on('payment_confirmed', (data) => {
        console.log('Payment confirmed event received:', data);
        
        // Check if this notification is for the current user
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (data.userId === userData.user_id) {
          const notification = data.notification;
          
          // Show toast notification
          toast.success(notification.content, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#4CAF50',
              color: '#fff',
            },
          });
          
          // Add to notifications list
          setNotifications(prev => {
            // Check if notification already exists
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
              return prev;
            }
            return [notification, ...prev];
          });
          setUnreadCount(prev => prev + 1);
        }
      });

      // Handle fetch notifications event
      socketRef.current.on('fetch_notifications', () => {
        console.log('Fetch notifications event received');
        fetchNotifications();
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching notifications with token:', token ? 'Token present' : 'No token');
      
      if (!token) {
        console.log('No token found, skipping notification fetch');
        return;
      }

      // First try the test endpoint
      try {
        const testResponse = await axios.get('http://localhost:3002/api/notifications/test');
        console.log('Test endpoint response:', testResponse.data);
      } catch (error) {
        console.error('Test endpoint failed:', error);
      }
      
      const response = await axios.get('http://localhost:3002/api/notifications', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Raw notifications response:', response.data);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Only try to mark as read if the notification has an ID
      if (notification.id) {
        console.log('Marking notification as read:', notification.id);
        
        const response = await axios.put(
          `http://localhost:3002/api/notifications/${notification.id}/read`,
          {},
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Mark as read response:', response.data);

        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => prev - 1);
      } else {
        // For notifications without ID, just remove them from the list
        setNotifications(prev => 
          prev.filter(n => 
            !(n.type === notification.type && 
              n.reference_id === notification.reference_id)
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Only navigate for non-payment notifications
      if (notification.type !== 'payment') {
        // Navigate based on notification type
        if (notification.type === 'message') {
          const userRole = localStorage.getItem('userRole');
          console.log('User role:', userRole);
          console.log('Notification reference_id:', notification.reference_id);
          
          if (userRole === 'Tourist') {
            console.log('Navigating to tourist messages with conversation:', notification.reference_id);
            navigate(`/tourist/messages?conversation=${notification.reference_id}`);
          } else if (userRole === 'Guide') {
            console.log('Navigating to guide messages with conversation:', notification.reference_id);
            navigate(`/guide/messages?conversation=${notification.reference_id}`);
          } else {
            console.error('Unknown user role:', userRole);
            // Fallback to the general messages route
            navigate(`/messages?conversation=${notification.reference_id}`);
          }
        } else if (notification.type === 'blog') {
          // Navigate to the blog page
          navigate('/blogs');
        }
      }
      
      setShowNotifications(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
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
    setUser(null);
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    const isAuthenticated = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Allow access to home, aboutus, and hireguide for non-admin users
    if (path === '/home' || path === '/aboutus' || path === '/hireguide') {
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      navigate(path);
      return;
    }

    // Handle profile navigation
    if (path === '/profile') {
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
        return;
      }
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      navigate(path);
      return;
    }

    // Require authentication for protected routes
    if (!isAuthenticated && path !== '/login' && path !== '/signup') {
      navigate('/login');
      return;
    }

    navigate(path);
  };

  return (
    <div>
      <Toaster position="top-right" />
      <header className='Header'>
        <h1 className="logoText" onClick={() => handleNavigation("/home")}>
          Yatra Nepal
        </h1>

        <nav className="navbar">
          <a onClick={() => handleNavigation("/home")}>Home</a>
          <a onClick={() => handleNavigation("/aboutus")}>About Us</a>
          <a onClick={() => handleNavigation("/hireguide")}>Hire Guide</a>
          <a onClick={() => handleNavigation("/profile")}>Profile</a>
          {user && (
            <div className="notification-container" ref={notificationRef}>
              <div className="notification-icon" onClick={() => {
                console.log('Notification icon clicked');
                console.log('Current notifications:', notifications);
                console.log('Unread count:', unreadCount);
                setShowNotifications(!showNotifications);
              }}>
                <FaBell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">No notifications</div>
                    ) : (
                      notifications.map((notification, index) => {
                        console.log('Rendering notification:', notification);
                        return (
                          <div
                            key={notification.id || `notification-${index}`}
                            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p>{notification.content}</p>
                            <span className="notification-time">
                              {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {user ? (
            <>
              <span className="username">Welcome, {user.name}</span>
              <span className="navButton" onClick={handleLogoutClick}>Logout</span>
            </>
          ) : (
            <span className="navButton active" onClick={() => handleNavigation("/login")}>
              Log In
            </span>
          )}
        </nav>
      </header>

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

      {showLoginPrompt && (
        <LoginPrompt onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  );
};

export default Navbar;