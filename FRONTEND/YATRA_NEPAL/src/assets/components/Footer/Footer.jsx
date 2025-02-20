import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa"; 
import "./Footer.scss";
export const Footer = () => {
  return (
    <footer className="footer">
    <div className="horizontal-line"></div>
    <div className="footer-container">
      <div className="footer-column">
        <img
          src="/src/assets/images/canva.png"
          alt="Yatra Nepal Logo"
          className="footer-logo"
        />
       
      </div>


      <div className="footer-column">
        <h4>Quick Links</h4>
        <nav className="footer-nav">
          <a href="/">Home</a>
          <a href="/donate">About Us</a>
          <a href="/request">Hire Guide</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </div>


      <div className="footer-column">
        <h4>Follow Us</h4>
        <div className="footer-social">
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </div>

  
    <div className="footer-copyright">
      &copy; {new Date().getFullYear()} Yatra Nepal. All Rights Reserved.
    </div>
  </footer>
);
};

export default Footer;
