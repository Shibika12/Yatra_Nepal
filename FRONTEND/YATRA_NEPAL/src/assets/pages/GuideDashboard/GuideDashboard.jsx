import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import './GuideDashboard.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';

const GuideDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone_number: '+977 9841234567',
    guide_type: 'Professional Guide',
    years_of_experience: '5',
    languages: 'English, Nepali, Hindi',
    about: 'Experienced trekking guide with expertise in Everest Base Camp and Annapurna Circuit treks. Passionate about sharing Nepal\'s rich culture and natural beauty with travelers.',
    specialization: 'Trekking, Cultural Tours, Mountain Climbing',
    profile_pic: '/default-profile.png'
  });

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
    setIsEditing(false);
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
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Phone:</strong> {formData.phone_number}</p>
                      <p><strong>Guide Type:</strong> {formData.guide_type}</p>
                      <p><strong>Experience:</strong> {formData.years_of_experience} years</p>
                      <p><strong>Languages:</strong> {formData.languages}</p>
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
              <Card className="about-card">
                <Card.Body>
                  <Card.Title>About Me</Card.Title>
                  {!isEditing ? (
                    <p>{formData.about}</p>
                  ) : (
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>

              <Card className="specialization-card">
                <Card.Body>
                  <Card.Title>Specialization</Card.Title>
                  {!isEditing ? (
                    <p>{formData.specialization}</p>
                  ) : (
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>

              <Card className="documents-card">
                <Card.Body>
                  <Card.Title>Documents</Card.Title>
                  <div className="documents-list">
                    <div className="document-item">
                      <h4>Guide License</h4>
                      <span className="status status-approved">Approved</span>
                      <p>License Number: GL-2024-001</p>
                      <p>Expiry Date: 31/12/2024</p>
                    </div>
                    <div className="document-item">
                      <h4>First Aid Certificate</h4>
                      <span className="status status-approved">Approved</span>
                      <p>Certificate Number: FA-2024-001</p>
                      <p>Expiry Date: 30/06/2024</p>
                    </div>
                    <div className="document-item">
                      <h4>Insurance</h4>
                      <span className="status status-approved">Approved</span>
                      <p>Policy Number: INS-2024-001</p>
                      <p>Expiry Date: 31/12/2024</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default GuideDashboard; 