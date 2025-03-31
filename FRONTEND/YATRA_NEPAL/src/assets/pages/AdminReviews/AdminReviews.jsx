import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar/AdminSidebar';
import './AdminReviews.scss';
import { FaStar, FaUser, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { Table, Container, Card, Badge } from 'react-bootstrap';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:3002/api/admin/guide-reviews');
        console.log('Reviews response:', response.data);
        setReviews(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        if (error.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Failed to load reviews. Please try again later.');
        }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <Container className="py-4">
            <div className="text-center">Loading reviews...</div>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main">
          <Container className="py-4">
            <div className="text-center text-danger">{error}</div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <Container className="py-4">
          <h2 className="mb-4">Guide Reviews</h2>
          
          {reviews.length === 0 ? (
            <Card className="text-center p-4">
              <Card.Body>
                <h4>No Reviews Yet</h4>
                <p>There are no guide reviews available at the moment.</p>
              </Card.Body>
            </Card>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Guide</th>
                    <th>Tourist</th>
                    <th>Rating</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.review_id}>
                      <td className="text-nowrap">{formatDate(review.review_date)}</td>
                      <td>
                        <div className="d-flex flex-column">
                          <span><FaUser className="me-2" />{review.guide_name}</span>
                          <small className="text-muted">
                            <FaEnvelope className="me-1" />{review.guide_email}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span><FaUser className="me-2" />{review.tourist_name}</span>
                          <small className="text-muted">
                            <FaEnvelope className="me-1" />{review.tourist_email}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="rating">
                          {renderStars(review.rating)}
                          <Badge bg="secondary" className="ms-2">
                            {review.rating}/5
                          </Badge>
                        </div>
                      </td>
                      <td>{review.review_text}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminReviews;