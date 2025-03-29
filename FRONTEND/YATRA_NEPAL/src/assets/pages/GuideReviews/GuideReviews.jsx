import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import axios from 'axios';
import './GuideReviews.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';
import { FaStar } from 'react-icons/fa';

const GuideReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.user_id) {
          throw new Error('User data not found');
        }

        const response = await axios.get(`http://localhost:3002/guide/reviews/${user.user_id}`);
        setReviews(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="guide-reviews-container">
      <GuideNavbar />
      <div className="guide-reviews-content">
        <Container>
          <h1>My Reviews</h1>
          
          {reviews.length === 0 ? (
            <Card className="no-reviews">
              <Card.Body>
                <p>No reviews yet.</p>
              </Card.Body>
            </Card>
          ) : (
            <div className="reviews-list">
              {reviews.map((review, index) => (
                <Card key={index} className="review-card">
                  <Card.Body>
                    <div className="review-header">
                      <div className="reviewer-info">
                        <h4>{review.tourist_name}</h4>
                        <p className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rating">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-text">{review.review_text}</p>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default GuideReviews; 