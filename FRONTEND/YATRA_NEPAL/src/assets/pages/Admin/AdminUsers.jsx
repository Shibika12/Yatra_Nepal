import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaCalendar } from 'react-icons/fa';
import './AdminUsers.scss';

const AdminUsers = () => {
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTourists = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3002/api/admin/tourists', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setTourists(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tourists:', error);
        setError('Failed to load tourists. Please try again later.');
        setLoading(false);
      }
    };

    fetchTourists();
  }, [navigate]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const filteredTourists = tourists.filter(tourist =>
    tourist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tourist.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="users-dashboard">
        <div className="loading">
          <div className="loader"></div>
          <p>Loading tourist information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-dashboard">
        <div className="no-users">
          <FaUser size={48} />
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Tourists Directory</h1>
          <p>Manage and view registered tourists from around the world</p>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tourists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="dashboard-content">
        {filteredTourists.length === 0 ? (
          <div className="no-users">
            <FaUser size={48} />
            <h3>No tourists found</h3>
            <p>There are no registered tourists matching your search criteria</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredTourists.map(tourist => (
              <div 
                key={tourist.user_id} 
                className={`user-card ${selectedUser?.user_id === tourist.user_id ? 'active' : ''}`}
                onClick={() => handleUserClick(tourist)}
              >
                <div className="user-avatar">
                  {tourist.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3>{tourist.name}</h3>
                  <p className="nationality">
                    <FaGlobe /> {tourist.nationality || 'Not specified'}
                  </p>
                  <p>
                    <FaEnvelope /> {tourist.email}
                  </p>
                  <p>
                    <FaPhone /> {tourist.phone_number || 'Not provided'}
                  </p>
                </div>
                <div className="card-footer">
                  <span className="join-date">
                    <FaCalendar /> Joined {formatDate(tourist.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="detail-section">
            <h3>Account Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <FaCalendar className="icon" />
                <div>
                  <label>Member Since</label>
                  <p>{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>
              <div className="detail-item">
                <FaGlobe className="icon" />
                <div>
                  <label>Nationality</label>
                  <p>{selectedUser.nationality || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers; 