import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { FaStar, FaUser, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import './GuideReviews.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';

const GuideReviews = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user_name: 'John Smith',
      user_email: 'john.smith@example.com',
      rating: 5,
      review: 'Amazing guide! Very knowledgeable about the local culture and history. Made our trek to Everest Base Camp unforgettable.',
      date: '2024-03-15'
    },
    {
      id: 2,
      user_name: 'Sarah Johnson',
      user_email: 'sarah.j@example.com',
      rating: 4,
      review: 'Great experience overall. The guide was professional and took good care of us during the trek.',
      date: '2024-03-10'
    },
    {
      id: 3,
      user_name: 'Michael Brown',
      user_email: 'michael.b@example.com',
      rating: 5,
      review: 'Best guide we could have asked for! His expertise in mountain climbing and local customs made our trip exceptional.',
      date: '2024-03-05'
    }
  ]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="guide-reviews-container">
      <GuideNavbar />
      <div className="guide-reviews-content">
        <Container>
          <h1>My Reviews</h1>
          
          <Row>
            {reviews.map((review) => (
              <Col md={6} lg={4} key={review.id}>
                <Card className="review-card">
                  <Card.Body>
                    <div className="review-header">
                      <div className="user-info">
                        <FaUser className="user-icon" />
                        <div className="user-details">
                          <h5>{review.user_name}</h5>
                          <div className="user-email">
                            <FaEnvelope className="email-icon" />
                            <span>{review.user_email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="review-date">
                        <FaCalendarAlt className="date-icon" />
                        <span>{formatDate(review.date)}</span>
                      </div>
                    </div>
                    
                    <div className="rating">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="review-text">{review.review}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default GuideReviews; 