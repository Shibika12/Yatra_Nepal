import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Navbar.scss";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
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

    // Prevent admin from accessing profile
    if (path === '/profile' && userRole === 'admin') {
      navigate('/admin/dashboard');
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
      <header className='Header'>
        <h1 className="logoText" onClick={() => handleNavigation("/home")} style={{ cursor: 'pointer' }}>Yatra Nepal</h1>

        <nav className="navbar">
          <a onClick={() => handleNavigation("/home")}>Home</a>
          <a onClick={() => handleNavigation("/aboutus")}>About Us</a>
          <Link to="/hire-guide">Hire Guide</Link>
          <a onClick={() => handleNavigation("/profile")}>Profile</a>
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

export default Navbar;