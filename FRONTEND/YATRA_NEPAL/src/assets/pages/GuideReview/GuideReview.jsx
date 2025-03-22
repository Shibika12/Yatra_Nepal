import React, { useState } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import './GuideReview.scss';

const GuideReview = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [guideName, setGuideName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', { name, email, guideName, rating, review });
    // Reset form
    setName('');
    setEmail('');
    setGuideName('');
    setRating(0);
    setReview('');
  };

  return (
    <div className="guide-review-page">
      <div className="review-header">
        <h1>Rate Your Guide Experience</h1>
        <p>Your feedback helps our guides improve and helps other travelers make informed decisions</p>
      </div>

      <div className="review-container">
        <div className="review-card">
          <div className="review-icon">
            <FaUserCircle />
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Guide's Name</label>
              <input
                type="text"
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
                placeholder="Enter your guide's name"
                required
              />
            </div>

            <div className="rating-section">
              <label>Rate your experience</label>
              <div className="star-rating">
                {[...Array(5)].map((_, index) => {
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
              <label>Your Review</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with the guide..."
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GuideReview;