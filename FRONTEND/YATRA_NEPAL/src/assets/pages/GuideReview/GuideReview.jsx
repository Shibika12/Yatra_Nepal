import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from 'react-icons/fa';
import "./GuideReview.scss";

export const GuideReview = () => {
  const navigate = useNavigate();

  const guides = [
    {
      id: 1,
      name: "Jimmy Miller",
      image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40",
      experience: "5 years",
      location: "Kathmandu",
      rating: 5,
      reviews: 15
    },
    {
      id: 2,
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      experience: "7 years",
      location: "Pokhara",
      rating: 5,
      reviews: 23
    },
    {
      id: 3,
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      experience: "4 years",
      location: "Kathmandu",
      rating: 4,
      reviews: 12
    }
  ];

  const recentReviews = [
    {
      id: 1,
      reviewNumber: "Review 1",
      name: "Jessica Harper",
      text: "I had an incredible experience with Ramesh, our guide in Kathmandu. He was extremely knowledgeable about the city's history and culture, and his enthusiasm made the tour unforgettable. From the intricate temples to hidden local eateries, Ramesh tailored the tour perfectly to our interests. Highly recommend him for anyone looking to explore Nepal authentically."
    },
    {
      id: 2,
      reviewNumber: "Review 2",
      name: "Jessica Harper",
      text: "Deepak was a great guide for our trek in the Annapurna region. His strong ties with the guides on the trek and broad knowledge, fascinating stories about the mountains and local traditions. The only reason I'm giving four stars is that we had to wait a bit longer than expected to start our trek due to some logistical issues. Nevertheless, the experience was amazing, and I would book him again!"
    }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "star filled" : "star"}
      />
    ));
  };

  return (
    <div className="guide-review-container">
      <h1>Guide Rating</h1>
      <div className="guides-list">
        {guides.map((guide) => (
          <div key={guide.id} className="guide-profile">
            <div className="guide-image">
              <img src={guide.image} alt={guide.name} />
            </div>
            <div className="guide-details">
              <h2>{guide.name}</h2>
              <div className="info-row">
                <p className="experience">Experience: {guide.experience}</p>
              </div>
              <div className="info-row">
                <p className="location">Based in: {guide.location}</p>
              </div>
              <div className="rating-row">
                <div className="stars">
                  {renderStars(guide.rating)}
                </div>
                <span className="reviews">{guide.reviews} Reviews</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-reviews-section">
        <h2>Recent Reviews</h2>
        {recentReviews.map((review) => (
          <div key={review.id} className="review-card">
            <h3>{review.reviewNumber}</h3>
            <p className="reviewer-name">Name: {review.name}</p>
            <p className="review-text">{review.text}</p>
          </div>
        ))}
      </div>

      <button 
        className="give-review-btn"
        onClick={() => navigate('/reviews')}
      >
        GIVE REVIEW
      </button>
    </div>
  );
};

export default GuideReview;