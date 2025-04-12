import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Payment.scss';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Log the full URL and search params
        console.log('Current URL:', window.location.href);
        console.log('Search Params:', location.search);
        console.log('Retry count:', retryCount);

        const searchParams = new URLSearchParams(location.search);
        const source = searchParams.get('source');
        const encodedData = searchParams.get('data');

        // Get stored transaction details
        const storedTransaction = localStorage.getItem('esewa_transaction');
        let transactionDetails = null;
        if (storedTransaction) {
          try {
            transactionDetails = JSON.parse(storedTransaction);
            console.log('Found stored transaction:', transactionDetails);
          } catch (e) {
            console.error('Error parsing stored transaction:', e);
          }
        }

        let decodedData = null;
        if (encodedData) {
          try {
            // Decode the base64 data
            const decodedStr = atob(encodedData);
            decodedData = JSON.parse(decodeURIComponent(decodedStr));
            console.log('Decoded eSewa data:', decodedData);
          } catch (e) {
            console.error('Error decoding eSewa data:', e);
          }
        }
        
        // Use decoded data or stored transaction details
        const transaction_uuid = decodedData?.transaction_uuid || transactionDetails?.transaction_uuid;
        const total_amount = decodedData?.total_amount || transactionDetails?.total_amount;
        const refId = decodedData?.refId;
        
        if (!transaction_uuid && retryCount >= MAX_RETRIES) {
          console.error('Max retries reached. Missing transaction details', {
            source,
            decodedData,
            storedTransaction: transactionDetails,
            retryCount
          });
          toast.error('Payment verification failed');
          setTimeout(() => navigate('/payment'), 2000);
          return;
        }

        if (!transaction_uuid) {
          console.log('Transaction details not found, retrying...', {
            retryCount,
            maxRetries: MAX_RETRIES
          });
          setRetryCount(prev => prev + 1);
          setTimeout(() => verifyPayment(), RETRY_DELAY);
          return;
        }

        console.log('Payment verification details:', {
          transaction_uuid,
          total_amount,
          refId,
          source,
          retryCount
        });

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to continue');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Send verification request
        const response = await axios.post(
          'http://localhost:3002/api/payments/esewa/verify',
          {
            transaction_uuid,
            transaction_code: refId || 'DIRECT',
            total_amount,
            status: 'COMPLETE',
            refId: refId || transaction_uuid
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Verification Response:', response.data);

        if (response.data.success) {
          // Clear stored transaction after successful verification
          localStorage.removeItem('esewa_transaction');
          
          setLoading(false);
          toast.success('Payment verified successfully!');
          // Redirect to home after 2 seconds
          setTimeout(() => navigate('/home'), 2000);
        } else {
          throw new Error(response.data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Verification Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to verify payment';
        
        // If we haven't reached max retries and it's a 500 error, retry
        if (retryCount < MAX_RETRIES && error.response?.status === 500) {
          console.log('Retrying verification...', {
            retryCount,
            maxRetries: MAX_RETRIES
          });
          setRetryCount(prev => prev + 1);
          setTimeout(() => verifyPayment(), RETRY_DELAY);
          return;
        }

        toast.error(errorMessage);
        // On error, redirect to payment page after 2 seconds
        setTimeout(() => navigate('/payment'), 2000);
      }
    };

    // Start verification immediately
    verifyPayment();
  }, [location.search, navigate, retryCount]);

  if (loading) {
    return (
      <div className="payment-wrapper">
        <Navbar />
        <div className="payment-success-container" style={{ 
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="loading" style={{ textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <h2 style={{ marginTop: '20px' }}>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment with eSewa</p>
            {retryCount > 0 && (
              <p style={{ color: '#666', marginTop: '10px' }}>
                Retry attempt {retryCount} of {MAX_RETRIES}...
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-wrapper">
      <Navbar />
      <div className="payment-success-container" style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="success-message" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#2ecc71', marginBottom: '20px' }}>Payment Successful!</h1>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            Thank you for your payment. Your guide booking has been confirmed.
          </p>
          <button 
            onClick={() => navigate('/home')} 
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
          >
            Return to Home
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess; 