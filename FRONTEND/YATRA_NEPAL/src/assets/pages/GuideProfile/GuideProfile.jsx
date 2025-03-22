import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { FaStar, FaMapMarkerAlt, FaClock, FaLanguage, FaArrowLeft, FaComment } from 'react-icons/fa';
import './GuideProfile.scss';

const GuideProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // This would typically come from an API call using the id
  const guide = {
    id: 1,
    name: "Jimmy Miller",
    image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40",
    experience: "5 years",
    location: "Kathmandu",
    rating: 5,
    reviews: 15,
    type: "Trekking Guide",
    languages: ["English", "Nepali", "Hindi"],
    specialization: "Annapurna Circuit, Everest Base Camp",
    about: "Professional trekking guide with extensive experience in high-altitude expeditions. Certified in wilderness first aid and mountain rescue operations.",
    reviews: [
      {
        id: 1,
        user: "John Doe",
        rating: 5,
        date: "March 15, 2024",
        comment: "Amazing experience! Jimmy is very knowledgeable and professional."
      },
      {
        id: 2,
        user: "Sarah Smith",
        rating: 5,
        date: "February 28, 2024",
        comment: "Great guide, made our trek to EBC memorable and safe."
      }
    ]
  };

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
                  <span>({guide.reviews.length} reviews)</span>
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
                {guide.reviews.map(review => (
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
                ))}
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