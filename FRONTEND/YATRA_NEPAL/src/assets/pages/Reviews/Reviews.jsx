import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { FiArrowLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import "./Reviews.scss";

export const Reviews = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');

  const guides = [
    { id: 1, name: "Jimmy Miller" },
    { id: 2, name: "Sarah Johnson" },
    { id: 3, name: "Michael Chen" }
  ];

  const existingReviews = [
    {
      id: 1,
      guideName: "Jimmy Miller",
      touristName: "Jessica Harper",
      rating: 5,
      date: "March 15, 2024",
      review: "I had an incredible experience with Ramesh..."
    },
    // Add more reviews
  ];

  const handleSubmitReview = (e) => {
    e.preventDefault();
    // Handle review submission logic here
    console.log({ selectedGuide, rating, reviewText });
  };

  return (
    <div className="reviews-page">
      <Navbar />
      
      <main className="reviews-content">
        <div className="reviews-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <h1>Guide Reviews</h1>
        </div>

        {/* Review Form Section */}
        <div className="review-form-section">
          <h2>Write a Review</h2>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Select Guide:</label>
              <select 
                value={selectedGuide}
                onChange={(e) => setSelectedGuide(e.target.value)}
                required
              >
                <option value="">Choose a guide...</option>
                {guides.map(guide => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Rating:</label>
              <div className="star-rating">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <FaStar
                      key={index}
                      className={ratingValue <= (hover || rating) ? "star filled" : "star"}
                      onClick={() => setRating(ratingValue)}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(rating)}
                    />
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Your Review:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience..."
                required
              />
            </div>

            <button type="submit" className="submit-review-btn">
              Submit Review
            </button>
          </form>
        </div>

        {/* Existing Reviews Section */}
        <div className="existing-reviews">
          <h2>All Reviews</h2>
          {existingReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <h3>{review.guideName}</h3>
                <div className="rating">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={index < review.rating ? "star filled" : "star"}
                    />
                  ))}
                </div>
              </div>
              <p className="reviewer-name">By: {review.touristName}</p>
              <p className="review-date">{review.date}</p>
              <p className="review-text">{review.review}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Reviews; 