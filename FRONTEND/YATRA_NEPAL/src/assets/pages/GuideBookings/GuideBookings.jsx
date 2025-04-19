import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GuideBookings.scss';
import GuideNavbar from '../../components/GuideNavbar/GuideNavbar';
import { FaCalendarAlt, FaUser, FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

const GuideBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3002/api/guides/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again later.');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="guide-bookings-wrapper">
        <GuideNavbar />
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guide-bookings-wrapper">
        <GuideNavbar />
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="guide-bookings-wrapper">
      <GuideNavbar />
      <div className="guide-bookings">
        <div className="bookings-container">
          <h1>My Bookings</h1>
          
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <FaCalendarAlt className="no-bookings-icon" />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="tourist-info">
                      <FaUser className="icon" />
                      <span>{booking.tourist_name}</span>
                    </div>
                    <div className="booking-status">
                      {getStatusIcon(booking.status)}
                      <span className={`status ${booking.status.toLowerCase()}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-item">
                      <FaCalendarAlt className="icon" />
                      <span>Booked at: {format(new Date(booking.booking_date), 'PPP')}</span>
                    </div>
                    <div className="detail-item">
                      <FaMoneyBillWave className="icon" />
                      <span>Amount: NPR {booking.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="payment-info">
                    <h4>Payment Details</h4>
                    <p>Transaction ID: {booking.transaction_id}</p>
                    <p>Payment Method: {booking.payment_method}</p>
                    <p>Payment Status: {booking.payment_status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideBookings; 