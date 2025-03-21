import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminSettings.scss';
import { FaCog, FaBell, FaGlobe, FaEnvelope } from 'react-icons/fa';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    maintenanceMode: false,
    platformName: 'Yatra Nepal',
    adminEmail: 'admin@yatranepal.com'
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleChange = (e) => {
    setSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings updated successfully!');
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="settings-container">
          <div className="settings-header">
            <h1><FaCog /> Admin Settings</h1>
            <p>Configure your Yatra Nepal preferences</p>
          </div>

          <div className="settings-card">
            <form onSubmit={handleSubmit}>
              {/* Platform Information */}
              <div className="settings-section">
                <h3><FaGlobe /> Platform Information</h3>
                <div className="form-group">
                  <label>Platform Name</label>
                  <input 
                    type="text"
                    name="platformName"
                    value={settings.platformName}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Admin Email</label>
                  <input 
                    type="email"
                    name="adminEmail"
                    value={settings.adminEmail}
                    onChange={handleChange}
                    disabled
                  />
                </div>
              </div>

              {/* Notification Settings */}
              <div className="settings-section">
                <h3><FaBell /> Notification Preferences</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <span>Email Notifications</span>
                    <p>Receive notifications about new guide applications and bookings</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={() => handleToggle('emailNotifications')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* System Settings */}
              <div className="settings-section">
                <h3><FaGlobe /> System Preferences</h3>
                <div className="setting-item">
                  <div className="setting-info">
                    <span>Maintenance Mode</span>
                    <p>Temporarily disable the platform for maintenance</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={() => handleToggle('maintenanceMode')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <button type="submit" className="save-button">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 