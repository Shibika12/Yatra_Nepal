import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminUsers.scss';
import { FaUser, FaEnvelope, FaPhone, FaGlobe, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:3002/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const tourists = response.data.filter(user => user.user_type === 'Tourist');
      setUsers(tourists);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nationality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
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

          {loading ? (
            <div className="loading">
              <div className="loader"></div>
              <p>Loading tourist information...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="no-users">
              <FaUser size={48} />
              <h3>No tourists found</h3>
              <p>There are no registered tourists matching your search criteria</p>
            </div>
          ) : (
            <div className="dashboard-content">
              <div className="users-grid">
                {filteredUsers.map(user => (
                  <div 
                    key={user.user_id} 
                    className={`user-card ${selectedUser?.user_id === user.user_id ? 'active' : ''}`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      <p className="nationality">
                        <FaGlobe /> {user.nationality || 'Not specified'}
                      </p>
                      <p className="email">
                        <FaEnvelope /> {user.email}
                      </p>
                    </div>
                    <div className="card-footer">
                      <span className="join-date">
                        <FaCalendar /> Joined {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedUser && (
                <div className="user-details-panel">
                  <div className="panel-header">
                    <div className="large-avatar">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <h2>{selectedUser.name}</h2>
                    <p className="user-location">
                      <FaMapMarkerAlt /> From {selectedUser.nationality || 'Not specified'}
                    </p>
                  </div>

                  <div className="panel-content">
                    <div className="detail-section">
                      <h3>Contact Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <FaEnvelope className="icon" />
                          <div>
                            <label>Email</label>
                            <p>{selectedUser.email}</p>
                          </div>
                        </div>
                        <div className="detail-item">
                          <FaPhone className="icon" />
                          <div>
                            <label>Phone</label>
                            <p>{selectedUser.phone_number || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

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
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 