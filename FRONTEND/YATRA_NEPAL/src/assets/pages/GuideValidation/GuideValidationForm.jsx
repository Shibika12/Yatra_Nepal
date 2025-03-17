import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Navbar from "../../components/Navbar/Navbar";
import "./GuideValidationForm.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const GuideValidationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    yearsOfExperience: '',
    citizenshipDocument: null,
    guideLicense: null
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check for userId in localStorage instead of sessionStorage
    const storedUserId = localStorage.getItem('tempGuideId');
    console.log('Retrieved user ID:', storedUserId); // Debug log
    
    if (!storedUserId) {
      alert('Please complete registration first');
      navigate('/signup');
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size should not exceed 5MB');
        e.target.value = '';
        return;
      }
      setFormData({
        ...formData,
        [docType]: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get userId from state instead of storage
    if (!userId) {
      alert('User ID not found. Please register first.');
      navigate('/signup');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('yearsOfExperience', formData.yearsOfExperience);
      submitData.append('citizenshipDocument', formData.citizenshipDocument);
      submitData.append('guideLicense', formData.guideLicense);
      submitData.append('userId', userId);

      console.log('Form Data being sent:', {
        yearsOfExperience: formData.yearsOfExperience,
        userId: userId,
        hasCitizenship: !!formData.citizenshipDocument,
        hasLicense: !!formData.guideLicense
      });

      const response = await axios.post(
        'http://localhost:3002/auth/guide-documents',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        // Clear the stored ID from localStorage
        localStorage.removeItem('tempGuideId');
        alert('Documents submitted successfully! Your account is pending admin approval.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data); // Debug log
      }
      const errorMessage = error.response?.data?.message || 'Error submitting documents. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="guide-container">
        <Container>
          <Row>
            <Col>
              <div className="validation-form">
                <h2>Tour Guide Validation</h2>
                <p className="subtitle">Please provide the following documents for verification</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Upload Citizenship Document</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'citizenshipDocument')}
                      required
                    />
                    <span className="file-status">
                      {formData.citizenshipDocument ? formData.citizenshipDocument.name : 'No file chosen'}
                    </span>
                  </div>
                  <div className="form-group">
                    <label>Upload Guide License</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'guideLicense')}
                      required
                    />
                    <span className="file-status">
                      {formData.guideLicense ? formData.guideLicense.name : 'No file chosen'}
                    </span>
                  </div>
                  <p className="info-text">
                    Your documents will be reviewed by our admin team. You will be notified once your account is verified.
                  </p>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default GuideValidationForm;