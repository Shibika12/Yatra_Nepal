import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./Navbar.scss";
export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div>
     <header className='Header'>
     <h1 className="logoText">Yatra Nepal</h1>

      <nav className="navbar">
        <a onClick={() => navigate("/home")}>Home</a>
        <a onClick={() => navigate("/aboutus")}>About Us</a>
        <a onClick={() => navigate("/hireguide")}>Hire Guide</a>
        <a onClick={() => navigate("/profile")}>Profile</a>
        <span className="navButton active" onClick={() => navigate("/login")}>
          Log In
        </span> 
      </nav>
     </header>
    </div>
  )
}

export default Navbar