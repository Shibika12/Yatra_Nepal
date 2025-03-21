import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.scss';
import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Yatra Nepal</h3>
          <p>Your trusted companion for exploring the beauty and culture of Nepal.</p>
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone />
              <span>+977 981-234-5678</span>
            </div>
            <div className="contact-item">
              <FaEnvelope />
              <span>info@yatranepal.com</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt />
              <span>Thamel, Kathmandu, Nepal</span>
            </div>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/aboutus">About Us</Link></li>
            <li><Link to="/hire-guide">Hire Guide</Link></li>
          </ul>
        </div>

        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Yatra Nepal. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
