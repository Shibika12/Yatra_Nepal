import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { FaStar, FaMapMarkerAlt, FaClock, FaLanguage, FaArrowLeft, FaComment } from 'react-icons/fa';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './GuideProfile.scss';

const GuideProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    fetchGuideData();
    fetchGuideReviews();
    fetchAvailability();
  }, [id]);

  const fetchGuideData = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/api/guides/guide-profile/${id}`);
      const guideData = response.data;
      
      setGuide({
        id: guideData.user_id,
        name: guideData.name,
        image: guideData.profile_pic ? `http://localhost:3002/${guideData.profile_pic}` : 'https://via.placeholder.com/150',
        experience: guideData.years_of_experience ? `${guideData.years_of_experience} years` : 'Not specified',
        location: guideData.nationality || 'Nepal',
        rating: 5, // You can implement rating system later
        type: guideData.guide_type || 'Guide',
        languages: guideData.languages ? guideData.languages.split(',').map(lang => lang.trim()) : ['English'],
        specialization: guideData.specialization || 'Not specified',
        about: guideData.about || 'No information provided'
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching guide data:', err);
      setError('Failed to load guide profile');
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/api/guides/guide-availability/${id}`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const tileClassName = ({ date }) => {
    if (!date) return '';
    const dateStr = date.toISOString().split('T')[0];
    const availabilityData = availability.find(a => {
      const availDate = a.date ? new Date(a.date).toISOString().split('T')[0] : null;
      return availDate === dateStr;
    });
    if (availabilityData) {
      return availabilityData.is_available ? 'available' : 'unavailable';
    }
    return '';
  };

  const fetchGuideReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:3002/api/guides/reviews/${id}`);
      setReviews(response.data.map(review => ({
        id: review.review_id,
        user: review.tourist_name,
        rating: review.rating,
        date: new Date(review.created_at).toLocaleDateString(),
        comment: review.review_text
      })));
    } catch (err) {
      console.error('Error fetching reviews:', err);
      // Don't set error state here as reviews are not critical
      setReviews([]);
    }
  };

  if (loading) return <div className="loading">Loading guide profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!guide) return <div className="error">Guide not found</div>;

  return (
    <div className="guide-profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="navigation-header">
          <button className="back-button" onClick={() => navigate('/hire-guide')}>
            <FaArrowLeft /> Back to Guides
          </button>
        </div>

        <div className="profile-content-wrapper">
          <div className="profile-main">
            <div className="profile-header">
              <div className="profile-image">
                <img src={guide.image} alt={guide.name} />
              </div>
              <div className="profile-info">
                <h1>{guide.name}</h1>
                <p className="guide-type">{guide.type}</p>
                <div className="rating">
                  <div className="stars">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className="star"
                        color={index < guide.rating ? "#FFD700" : "#e4e5e9"}
                      />
                    ))}
                  </div>
                  <span>({reviews.length} reviews)</span>
                </div>
                <div className="details">
                  <p><FaMapMarkerAlt /> {guide.location}</p>
                  <p><FaClock /> {guide.experience}</p>
                  <p><FaLanguage /> {guide.languages.join(", ")}</p>
                </div>
              </div>
            </div>

            <div className="profile-details">
              <div className="about-section">
                <h2>About</h2>
                <p>{guide.about}</p>
              </div>

              <div className="specialization-section">
                <h2>Specialization</h2>
                <p>{guide.specialization}</p>
              </div>

              <div className="availability-section">
                <h2>Availability</h2>
                <div className="availability-calendar">
                  <Calendar
                    value={new Date()}
                    tileClassName={tileClassName}
                    minDate={new Date()}
                  />
                  <div className="availability-legend">
                    <div className="legend-item">
                      <div className="legend-color available"></div>
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color unavailable"></div>
                      <span>Unavailable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-sidebar">
            <div className="action-buttons">
              <button 
                className="book-now-btn"
                onClick={() => navigate('/payment')}
              >
                Book Now
              </button>
              <button className="chat-btn">
                <FaComment /> Chat with Guide
              </button>
            </div>

            <div className="chat-preview">
              <h3>Chat</h3>
              <div className="chat-messages">
                <p className="chat-placeholder">Start a conversation with {guide.name}</p>
              </div>
              <div className="chat-input">
                <input type="text" placeholder="Type a message..." disabled />
                <button disabled>Send</button>
              </div>
            </div>

            <div className="reviews-section">
              <h2>Reviews</h2>
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <h3>{review.user}</h3>
                        <div className="review-rating">
                          {[...Array(5)].map((_, index) => (
                            <FaStar
                              key={index}
                              className="star"
                              color={index < review.rating ? "#FFD700" : "#e4e5e9"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="review-date">{review.date}</p>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-reviews">No reviews yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GuideProfile; 