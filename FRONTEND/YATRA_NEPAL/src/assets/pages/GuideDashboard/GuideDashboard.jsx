import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Badge } from 'react-bootstrap';
import { FaUser, FaStar, FaLanguage, FaBriefcase, FaPhone, FaEnvelope, FaComments, FaPaperPlane, FaTimes, FaChartLine, FaUsers, FaEdit } from 'react-icons/fa';
import './GuideDashboard.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';

const GuideDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSpecialization, setIsEditingSpecialization] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    guide_type: '',
    years_of_experience: '',
    languages: '',
    about: '',
    specialization: '',
    profile_pic: '/default-profile.png'
  });

  // Sample data for dashboard stats
  const [dashboardStats] = useState({
    totalBookings: 45,
    averageRating: 4.8,
    totalEarnings: 25000
  });

  // Sample data for recent messages
  const [recentMessages] = useState([
    {
      id: 1,
      user_name: 'John Smith',
      message: 'Hi, I\'m interested in booking a trek to Everest Base Camp.',
      time: '10:30 AM',
      unread: true,
      messages: [
        { text: 'Hi, I\'m interested in booking a trek to Everest Base Camp.', sender: 'user', time: '10:30 AM' },
        { text: 'Hello John! I\'d be happy to help you with the Everest Base Camp trek. When are you planning to go?', sender: 'guide', time: '10:32 AM' }
      ]
    },
    {
      id: 2,
      user_name: 'Sarah Johnson',
      message: 'Could you tell me more about the Annapurna Circuit trek?',
      time: '9:15 AM',
      unread: false,
      messages: [
        { text: 'Could you tell me more about the Annapurna Circuit trek?', sender: 'user', time: '9:15 AM' }
      ]
    },
    {
      id: 3,
      user_name: 'Michael Brown',
      message: 'Thank you for the great experience last week!',
      time: 'Yesterday',
      unread: true,
      messages: [
        { text: 'Thank you for the great experience last week!', sender: 'user', time: 'Yesterday' }
      ]
    }
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        guide_type: user.guide_type || '',
        years_of_experience: user.years_of_experience || '',
        languages: user.languages || '',
        about: user.about || '',
        specialization: user.specialization || '',
        profile_pic: user.profile_pic || '/default-profile.png'
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setFormData(prev => ({
        ...prev,
        profile_pic: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        ...formData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    setIsEditing(false);
  };

  const handleAboutSubmit = (e) => {
    e.preventDefault();
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        about: formData.about
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    setIsEditingAbout(false);
  };

  const handleSpecializationSubmit = (e) => {
    e.preventDefault();
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        specialization: formData.specialization
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    setIsEditingSpecialization(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChat) {
      // Here you would typically send the message to your backend
      const updatedMessages = recentMessages.map(msg => {
        if (msg.id === selectedChat.id) {
          return {
            ...msg,
            messages: [
              ...msg.messages,
              { text: newMessage, sender: 'guide', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]
          };
        }
        return msg;
      });
      setNewMessage('');
    }
  };

  const handleChatClick = (message) => {
    setSelectedChat(message);
    setShowChat(true);
  };

  return (
    <div className="guide-dashboard-container">
      <GuideNavbar />
      <div className="guide-dashboard-content">
        <Container>
          <h1>Guide Profile</h1>
          
          <Row>
            <Col md={4}>
              <Card className="profile-card">
                <Card.Body>
                  <div className="profile-image-container">
                    <img 
                      src={formData.profile_pic} 
                      alt="Profile" 
                      className="profile-image"
                    />
                    {isEditing && (
                      <Form.Group>
                        <Form.Label>Change Profile Picture</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Form.Group>
                    )}
                  </div>
                  {!isEditing ? (
                    <div className="profile-info">
                      <h3>{formData.name}</h3>
                      <div className="info-item">
                        <FaEnvelope className="icon" />
                        <span>{formData.email}</span>
                      </div>
                      <div className="info-item">
                        <FaPhone className="icon" />
                        <span>{formData.phone_number}</span>
                      </div>
                      <div className="info-item">
                        <FaBriefcase className="icon" />
                        <span>{formData.guide_type}</span>
                      </div>
                      <div className="info-item">
                        <FaStar className="icon" />
                        <span>{formData.years_of_experience} years experience</span>
                      </div>
                      <div className="info-item">
                        <FaLanguage className="icon" />
                        <span>{formData.languages}</span>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={() => setIsEditing(true)}
                        className="edit-button"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control
                          type="number"
                          name="years_of_experience"
                          value={formData.years_of_experience}
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Languages</Form.Label>
                        <Form.Control
                          type="text"
                          name="languages"
                          value={formData.languages}
                          placeholder="e.g., English, Nepali, Hindi"
                          onChange={handleInputChange}
                        />
                      </Form.Group>

                      <div className="button-group">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col md={8}>
              <Row>
                <Col md={6}>
                  <Card className="stats-card">
                    <Card.Body>
                      <div className="stats-grid">
                        <div className="stat-item">
                          <FaUsers className="stat-icon" />
                          <div className="stat-info">
                            <h4>{dashboardStats.totalBookings}</h4>
                            <p>Total Bookings</p>
                          </div>
                        </div>
                        <div className="stat-item">
                          <FaStar className="stat-icon" />
                          <div className="stat-info">
                            <h4>{dashboardStats.averageRating}</h4>
                            <p>Average Rating</p>
                          </div>
                        </div>
                        <div className="stat-item">
                          <FaChartLine className="stat-icon" />
                          <div className="stat-info">
                            <h4>₹{dashboardStats.totalEarnings}</h4>
                            <p>Total Earnings</p>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="messages-card">
                    <Card.Body>
                      <div className="messages-header">
                        <h5>Recent Messages</h5>
                        <Button variant="link" onClick={() => setShowChat(true)}>
                          View All
                        </Button>
                      </div>
                      <div className="messages-list">
                        {recentMessages.map((msg) => (
                          <div key={msg.id} className="message-item" onClick={() => handleChatClick(msg)}>
                            <div className="message-content">
                              <h6>{msg.user_name}</h6>
                              <p>{msg.message}</p>
                            </div>
                            <div className="message-meta">
                              <span className="time">{msg.time}</span>
                              {msg.unread && <Badge bg="primary">New</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="about-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title>About Me</Card.Title>
                    {!isEditingAbout && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditingAbout(true)}
                        className="edit-section-btn"
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                    )}
                  </div>
                  {!isEditingAbout ? (
                    <p>{formData.about || 'No description added yet.'}</p>
                  ) : (
                    <Form onSubmit={handleAboutSubmit}>
                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="about"
                          value={formData.about}
                          onChange={handleInputChange}
                          placeholder="Tell tourists about yourself..."
                        />
                      </Form.Group>
                      <div className="d-flex gap-2 mt-3">
                        <Button variant="secondary" onClick={() => setIsEditingAbout(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>

              <Card className="specialization-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title>Specialization</Card.Title>
                    {!isEditingSpecialization && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditingSpecialization(true)}
                        className="edit-section-btn"
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                    )}
                  </div>
                  {!isEditingSpecialization ? (
                    <p>{formData.specialization || 'No specialization added yet.'}</p>
                  ) : (
                    <Form onSubmit={handleSpecializationSubmit}>
                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="What are your areas of expertise?"
                        />
                      </Form.Group>
                      <div className="d-flex gap-2 mt-3">
                        <Button variant="secondary" onClick={() => setIsEditingSpecialization(false)}>
                          Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Chat Modal */}
      <Modal show={showChat} onHide={() => setShowChat(false)} size="lg" className="chat-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaComments className="me-2" />
            {selectedChat ? `Chat with ${selectedChat.user_name}` : 'Messages'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="chat-container">
            <div className="chat-messages">
              {selectedChat ? (
                selectedChat.messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender === 'guide' ? 'guide-message' : ''}`}>
                    <div className="message-avatar">
                      <FaUser />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <h6>{msg.sender === 'guide' ? formData.name : selectedChat.user_name}</h6>
                        <span className="time">{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="chat-message" onClick={() => handleChatClick(msg)}>
                    <div className="message-avatar">
                      <FaUser />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <h6>{msg.user_name}</h6>
                        <span className="time">{msg.time}</span>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {selectedChat && (
              <Form onSubmit={handleSendMessage} className="chat-input">
                <Form.Group className="mb-0">
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" variant="primary">
                      <FaPaperPlane />
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GuideDashboard; 