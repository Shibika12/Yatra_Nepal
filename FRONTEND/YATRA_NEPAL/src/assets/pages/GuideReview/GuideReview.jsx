import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import './GuideReview.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GuideReview = () => {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to verify user authentication
  const verifyAuth = () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    console.log('Token:', token);
    console.log('User:', userString);
    
    if (!token || !userString) {
      console.log('Missing token or user data');
      return false;
    }

    try {
      const userData = JSON.parse(userString);
      console.log('Parsed User Data:', userData);
      
      // Check if user data has the required fields
      if (!userData || !userData.user_id) {
        console.log('Missing user_id in user data');
        return false;
      }

      // Check user role/type
      const userRole = userData.role || userData.user_type;
      console.log('User Role:', userRole);
      
      return userRole && userRole.toLowerCase() === 'tourist';
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchGuides = async () => {
      console.log('Starting fetchGuides...');
      const isAuthenticated = verifyAuth();
      console.log('Authentication check result:', isAuthenticated);

      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login...');
        navigate('/login');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('Current user data:', userData);

        // Set up axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['Content-Type'] = 'application/json';

        console.log('Fetching guides...');
        const response = await axios.get('http://localhost:3002/api/guides/all-guides', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Guides response:', response.data);

        if (!Array.isArray(response.data)) {
          console.error('Invalid guides data received:', response.data);
          setError('Failed to load guides. Invalid data format.');
          setLoading(false);
          return;
        }

        // Filter and sort guides
        const guidesData = response.data
          .filter(guide => guide && guide.name && guide.user_id !== userData.user_id)
          .sort((a, b) => a.name.localeCompare(b.name));

        console.log('Processed guides data:', guidesData);
        setGuides(guidesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching guides:', error);
        if (error.response?.status === 401) {
          console.log('Received 401 error, clearing auth data...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to load guides. Please try again later.');
          setLoading(false);
        }
      }
    };

    fetchGuides();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!verifyAuth()) {
        setError('Please log in as a tourist to submit a review');
        setTimeout(() => navigate('/login'), 2000);
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        // Add debug logging
        console.log('User data from localStorage:', userData);
        console.log('User type:', userData?.user_type || userData?.role);
        console.log('User ID:', userData?.user_id);

        if (!selectedGuide || !rating || !reviewText.trim()) {
            setError('Please fill in all fields');
            return;
        }

        const reviewData = {
            user_id: userData.user_id,
            guide_user_id: selectedGuide,
            rating: parseInt(rating),
            review_text: reviewText.trim()
        };

        console.log('Submitting review with data:', reviewData);

        const response = await axios.post(
            `http://localhost:3002/api/guides/reviews/${selectedGuide}`,
            {
                rating: parseInt(rating),
                review_text: reviewText.trim()
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Review submission response:', response.data);
        alert('Review submitted successfully!');
        
        // Clear form after successful submission
        setSelectedGuide('');
        setRating(0);
        setReviewText('');
        
    } catch (error) {
        console.error('Error submitting review:', error);
        console.error('Error response:', error.response?.data);
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setError('Your session has expired. Please log in again.');
            setTimeout(() => navigate('/login'), 2000);
        } else if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError('Failed to submit review. Please try again.');
        }
    }
  };

  if (loading) {
    return (
      <div className="guide-review-page">
        <div className="loading">Loading guides...</div>
      </div>
    );
  }

  return (
    <div className="guide-review-page">
      <div className="review-form-container">
        <h2>Submit a Guide Review</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Guide:</label>
            <select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              required
            >
              <option value="">Choose a guide...</option>
              {Array.isArray(guides) && guides.length > 0 ? (
                guides.map((guide) => (
                  <option key={guide.user_id} value={guide.user_id}>
                    {guide.name} ({guide.guide_type || 'General Guide'})
                  </option>
                ))
              ) : (
                <option value="" disabled>No guides available</option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Rating:</label>
            <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onClick={() => setRating(ratingValue)}
                    />
                    <FaStar
                      className="star"
                      color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Review:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              placeholder="Write your review here..."
            />
          </div>

          <button type="submit" className="submit-button">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuideReview;