import React, { useState } from "react";
import "./AccountSetting.scss"

export const AccountSetting = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zip: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile saved:", formData);
  };

  return (
    <div className="Profile-container">
      <h1>Account Settings</h1>
      <p className="subtitle">Manage your personal information and preferences</p>

      <div className="settings-section">
        <h2>Personal Information</h2>
        
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="firstName" 
              placeholder="Enter your full name"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="Enter your phone number"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <select name="country" onChange={handleChange}>
              <option value="">Select your country</option>
              {/* Add country options here */}
            </select>
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSetting;
