import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FaStar, FaUser, FaEnvelope } from 'react-icons/fa';
import './GuideReviews.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GuideReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Get user data from localStorage
        const userString = localStorage.getItem('user');
        if (!userString) {
          setError('Please log in to view reviews');
          navigate('/login');
          return;
        }

        const userData = JSON.parse(userString);
        if (!userData || !userData.user_id) {
          setError('Invalid user data');
          navigate('/login');
          return;
        }

        // Set up axios headers
        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch reviews for the current guide
        const response = await axios.get(`http://localhost:3002/api/guides/reviews/${userData.user_id}`);
        console.log('Reviews response:', response.data);
        setReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to load reviews. Please try again later.');
        }
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="guide-reviews-container">
        <GuideNavbar />
        <div className="guide-reviews-content">
          <Container>
            <div className="loading">Loading reviews...</div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guide-reviews-container">
        <GuideNavbar />
        <div className="guide-reviews-content">
          <Container>
            <div className="error-message">{error}</div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-reviews-container">
      <GuideNavbar />
      <div className="guide-reviews-content">
        <Container>
          <h1>My Reviews</h1>
          
          {reviews.length === 0 ? (
            <div className="no-reviews">No reviews yet.</div>
          ) : (
            <Row>
              {reviews.map((review) => (
                <Col md={6} lg={4} key={review.review_id}>
                  <Card className="review-card">
                    <Card.Body>
                      <div className="review-header">
                        <div className="user-info">
                          <FaUser className="user-icon" />
                          <div className="user-details">
                            <h5>{review.reviewer_name}</h5>
                            <div className="user-email">
                              <FaEnvelope className="email-icon" />
                              <span>{review.reviewer_email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rating">
                        {renderStars(review.rating)}
                      </div>
                      
                      <p className="review-text">{review.review_text}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </div>
  );
};

export default GuideReviews; 