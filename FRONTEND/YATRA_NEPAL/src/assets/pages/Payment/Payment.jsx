import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Payment.scss';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { toast } from 'react-toastify';
import { submitEsewaPayment } from '../../../utils/esewaPayment';


const dummyQRCode = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png";

const Payment = () => {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const [guideDetails, setGuideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const formRef = useRef(null);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 15000, 
    taxAmount: 1500, 
    totalAmount: 16500, 
  });
  const [customAmount, setCustomAmount] = useState('');
  const [duration, setDuration] = useState(5);

  useEffect(() => {
    console.log('Current guideId:', guideId); 
    if (!guideId) {
      console.log('No guideId found, redirecting...'); 
      setLoading(false);
      toast.error('No guide selected. Please select a guide first.');
      navigate('/hireguide');
      return;
    }
    fetchGuideDetails();
  }, [guideId, navigate]);


  useEffect(() => {
    if (customAmount) {
      const amount = parseFloat(customAmount);
      if (!isNaN(amount) && amount > 0) {
        const taxAmount = amount * 0.1; 
        const totalAmount = amount + taxAmount;
        setPaymentDetails({
          amount: amount,
          taxAmount: taxAmount,
          totalAmount: totalAmount
        });
      }
    }
  }, [customAmount]);

  const fetchGuideDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to proceed with payment');
        navigate('/login');
        return;
      }

      console.log('Fetching guide details for ID:', guideId);
      const response = await axios.get(
        `http://localhost:3002/api/guides/guide-profile/${guideId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Guide details response:', response.data);
      
      if (!response.data) {
        console.log('No guide data received');
        toast.error('Guide not found');
        navigate('/hireguide');
        return;
      }
      
      setGuideDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guide details:', error.response || error);
      toast.error(error.response?.data?.message || 'Failed to load guide details');
      navigate('/hireguide');
      setLoading(false);
    }
  };

  const handleEsewaPayment = async () => {
    try {
      setProcessingPayment(true);

      // Validate amount
      if (!customAmount || customAmount <= 0) {
        toast.error('Please enter a valid amount');
        setProcessingPayment(false);
        return;
      }

      // Calculate tax and total
      const amount = parseFloat(customAmount);
      const taxAmount = amount * 0.13; // 13% tax
      const totalAmount = amount + taxAmount;

      const paymentDetails = {
        amount: amount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        duration: duration,
        guide_id: parseInt(guideId)
      };

      console.log('Initiating eSewa payment with details:', paymentDetails);

      const response = await submitEsewaPayment(
        paymentDetails,
        `Guide Booking for ${duration} days`
      );

      if (!response) {
        throw new Error('Failed to initiate payment');
      }

      // The form submission will redirect to eSewa, no need to handle success here
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      setProcessingPayment(false);
    }
  };

  const handleAmountChange = (e) => {
    setCustomAmount(e.target.value);
  };

  const handleDurationChange = (e) => {
    setDuration(parseInt(e.target.value));
  };

  if (loading) {
    return (
      <div className="payment-wrapper">
        <Navbar />
        <div className="loading">Loading payment details...</div>
        <Footer />
      </div>
    );
  }

  if (!guideDetails) {
    return (
      <div className="payment-wrapper">
        <Navbar />
        <div className="error">Please select a guide to proceed with payment.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <Navbar />
      <div className="payment-page">
        <div className="payment-container">
          <h1>Payment Details</h1>
          <div className="payment-form">
            <div className="booking-summary">
              <h2>Booking Summary</h2>
              <div className="summary-details">
                <div className="summary-item">
                  <span>Guide Name:</span>
                  <span>{guideDetails.name}</span>
                </div>
                <div className="summary-item">
                  <span>Guide Type:</span>
                  <span>{guideDetails.guide_type}</span>
                </div>
                <div className="summary-item">
                  <span>Duration:</span>
                  <div className="duration-selector">
                    <select 
                      value={duration} 
                      onChange={handleDurationChange}
                      className="duration-select"
                    >
                      <option value="1">1 Day</option>
                      <option value="2">2 Days</option>
                      <option value="3">3 Days</option>
                      <option value="4">4 Days</option>
                      <option value="5">5 Days</option>
                      <option value="6">6 Days</option>
                      <option value="7">7 Days</option>
                      <option value="8">8 Days</option>
                      <option value="9">9 Days</option>
                      <option value="10">10 Days</option>
                      <option value="11">11 Days</option>
                      <option value="12">12 Days</option>
                      <option value="13">13 Days</option>
                      <option value="14">14 Days</option>
                      <option value="15">15 Days</option>
                      <option value="16">16 Days</option>
                      <option value="17">17 Days</option>
                      <option value="18">18 Days</option>
                      <option value="19">19 Days</option>
                      <option value="20">20 Days</option>
                      <option value="21">21 Days</option>
                      <option value="22">22 Days</option>
                      <option value="23">23 Days</option>
                      <option value="24">24 Days</option>
                      <option value="25">25 Days</option>
                      <option value="26">26 Days</option>
                      <option value="27">27 Days</option>
                      <option value="28">28 Days</option>
                      <option value="29">29 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>
                <div className="summary-item">
                  <span>Base Amount:</span>
                  <div className="amount-input">
                    <input
                      type="number"
                      value={customAmount || paymentDetails.amount}
                      onChange={handleAmountChange}
                      placeholder="Enter amount"
                      min="1000"
                      step="100"
                      className="amount-field"
                    />
                    <span className="currency">NPR</span>
                  </div>
                </div>
                <div className="summary-item">
                  <span>Tax Amount:</span>
                  <span>NPR {paymentDetails.taxAmount}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span>NPR {paymentDetails.totalAmount}</span>
                </div>
              </div>
            </div>
            <div className="payment-methods">
              <h2>Payment Options</h2>
              <div className="payment-buttons">
                <button 
                  className="esewa-button"
                  onClick={handleEsewaPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Pay with eSewa'}
                </button>
                <form 
                  ref={formRef} 
                  style={{ display: 'none' }}
                  method="POST"
                  target="_self"
                  encType="application/x-www-form-urlencoded"
                  acceptCharset="UTF-8"
                ></form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Payment; 