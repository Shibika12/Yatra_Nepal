import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AccountSetting.scss"

export const AccountSetting = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    nationality: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      console.log('User data from localStorage:', userData);
      
      if (!userData) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      console.log('Parsed user data:', user);
      
      if (!user || user.user_type !== "Tourist") {
        setError('Access denied. Only tourists can view this page.');
        setLoading(false);
        return;
      }

      console.log('Making request to:', `http://localhost:3002/api/tourists/profile/${user.user_id}`);
      const response = await axios.get(`http://localhost:3002/api/tourists/profile/${user.user_id}`);
      console.log('Response data:', response.data);
      
      if (response.data) {
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone_number: response.data.phone_number || '',
          nationality: response.data.nationality || '',
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load profile. Please try again later.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not found. Please login again.');
        return;
      }

      const user = JSON.parse(userData);
      if (!user || !user.user_id) {
        setError('Invalid user data');
        return;
      }

      const response = await axios.put(
        `http://localhost:3002/api/tourists/profile/${user.user_id}`,
        formData
      );
      
      // Update local storage with new user data
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Show success toast notification
      toast.success('Changes saved successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile. Please try again later.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="Profile-container">
      <ToastContainer />
      <h1>Account Settings</h1>
      <p className="subtitle">Manage your personal information and preferences</p>

      <div className="settings-section">
        <h2>Personal Information</h2>
        
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name}
              placeholder="Enter your full name"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email}
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone_number" 
              value={formData.phone_number}
              placeholder="Enter your phone number"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Nationality</label>
            <input 
              type="text" 
              name="nationality" 
              value={formData.nationality}
              placeholder="Enter your nationality"
              onChange={handleChange}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" className="cancel-btn" onClick={fetchUserData}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSetting;
