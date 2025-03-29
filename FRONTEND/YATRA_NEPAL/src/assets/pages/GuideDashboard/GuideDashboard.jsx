import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Badge } from 'react-bootstrap';
import { FaUser, FaStar, FaLanguage, FaBriefcase, FaPhone, FaEnvelope, FaEdit, FaComments, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import './GuideDashboard.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';

const GuideDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSpecialization, setIsEditingSpecialization] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Static data for messages
  const [messages] = useState([
    {
      id: 1,
      tourist: 'John Doe',
      lastMessage: 'Hello, I\'m interested in booking a trek',
      unread: true,
      messages: [
        { id: 1, sender: 'tourist', text: 'Hello, I\'m interested in booking a trek', time: '10:00 AM' },
        { id: 2, sender: 'guide', text: 'Hi! Sure, I\'d be happy to help. What kind of trek are you looking for?', time: '10:05 AM' }
      ]
    },
    {
      id: 2,
      tourist: 'Jane Smith',
      lastMessage: 'What\'s the best time to visit?',
      unread: false,
      messages: [
        { id: 1, sender: 'tourist', text: 'What\'s the best time to visit?', time: '9:30 AM' },
        { id: 2, sender: 'guide', text: 'The best time for trekking is from March to May and September to November.', time: '9:35 AM' }
      ]
    }
  ]);

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

  useEffect(() => {
    fetchGuideData();
  }, []);

  const fetchGuideData = async () => {
    try {
      const userData = localStorage.getItem('user');
      console.log('User data from localStorage:', userData);

      if (!userData) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
        console.log('Parsed user data:', user);
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        setError('Error reading user data. Please login again.');
        setLoading(false);
        return;
      }

      // Check if user is a guide
      if (!user || user.user_type !== "Guide") {
        setError('Access denied. Only guides can view this page.');
        setLoading(false);
        return;
      }

      const userId = user.user_id;
      if (!userId) {
        console.error('No user ID found in:', user);
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Making API request with user ID:', userId);
      const response = await axios.get(`http://localhost:3002/api/guides/guide-profile/${userId}`);
      console.log('API response:', response.data);

      if (response.data) {
        setFormData(prev => ({
          ...prev,
          ...response.data,
          profile_pic: response.data.profile_pic ? 
            `http://localhost:3002/${response.data.profile_pic}` : 
            '/default-profile.png'
        }));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching guide data:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      setError(err.response?.data?.message || 'Failed to load guide profile. Please try again later.');
      setLoading(false);
    }
  };

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not found. Please login again.');
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (parseError) {
        setError('Error reading user data. Please login again.');
        return;
      }

      const userId = user.user_id;
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      // Create FormData object for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('years_of_experience', formData.years_of_experience);
      formDataToSend.append('languages', formData.languages);
      formDataToSend.append('about', formData.about);
      formDataToSend.append('specialization', formData.specialization);
      
      if (profileImage) {
        formDataToSend.append('profile_pic', profileImage);
      }

      await axios.put(
        `http://localhost:3002/api/guides/guide-profile/${userId}`, 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setIsEditing(false);
      fetchGuideData();
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      setError('Failed to update profile. Please try again later.');
    }
  };

  const handleAboutUpdate = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not found. Please login again.');
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (parseError) {
        setError('Error reading user data. Please login again.');
        return;
      }

      const userId = user.user_id;
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('about', formData.about);

      await axios.put(
        `http://localhost:3002/api/guides/guide-profile/${userId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setIsEditingAbout(false);
      fetchGuideData();
    } catch (err) {
      console.error('Error updating about section:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      setError('Failed to update about section. Please try again later.');
    }
  };

  const handleSpecializationUpdate = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not found. Please login again.');
        return;
      }

      let user;
      try {
        user = JSON.parse(userData);
      } catch (parseError) {
        setError('Error reading user data. Please login again.');
        return;
      }

      const userId = user.user_id;
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('specialization', formData.specialization);

      await axios.put(
        `http://localhost:3002/api/guides/guide-profile/${userId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setIsEditingSpecialization(false);
      fetchGuideData();
    } catch (err) {
      console.error('Error updating specialization:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      setError('Failed to update specialization. Please try again later.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const updatedMessages = messages.map(chat => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, {
            id: chat.messages.length + 1,
            sender: 'guide',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        };
      }
      return chat;
    });

    setMessages(updatedMessages);
    setNewMessage('');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="guide-dashboard-container">
      <GuideNavbar />
      <div className="guide-dashboard-content">
        <Container>
          <Row className="mb-4">
            <Col>
              <h1>Guide Profile</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={() => setShowChat(true)}
                className="messages-button"
              >
                <FaComments className="me-2" />
                Messages
                {messages.some(m => m.unread) && (
                  <Badge bg="danger" className="ms-2">New</Badge>
                )}
              </Button>
            </Col>
          </Row>
          
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
                    <Form onSubmit={handleProfileUpdate}>
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
                    <Form onSubmit={handleAboutUpdate}>
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
                    <Form onSubmit={handleSpecializationUpdate}>
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

        {/* Chat Modal */}
        <Modal show={showChat} onHide={() => setShowChat(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedChat ? `Chat with ${selectedChat.tourist}` : 'Messages'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!selectedChat ? (
              <div className="messages-list">
                {messages.map(chat => (
                  <div
                    key={chat.id}
                    className={`message-item ${chat.unread ? 'unread' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="message-avatar">
                      <FaUser />
                    </div>
                    <div className="message-content">
                      <h6>{chat.tourist}</h6>
                      <p>{chat.lastMessage}</p>
                    </div>
                    {chat.unread && <Badge bg="danger">New</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="chat-container">
                <div className="chat-messages">
                  {selectedChat.messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.sender === 'guide' ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">
                        <p>{message.text}</p>
                        <small>{message.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <Form onSubmit={handleSendMessage} className="chat-input">
                  <Form.Group className="d-flex">
                    <Form.Control
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                    />
                    <Button type="submit" variant="primary" className="ms-2">
                      <FaPaperPlane />
                    </Button>
                  </Form.Group>
                </Form>
              </div>
            )}
          </Modal.Body>
          {selectedChat && (
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedChat(null)}>
                Back to Messages
              </Button>
            </Modal.Footer>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default GuideDashboard; 