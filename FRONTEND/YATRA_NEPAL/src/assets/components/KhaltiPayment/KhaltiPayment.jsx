import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './KhaltiPayment.scss';

const KhaltiPayment = ({ bookingId, amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Convert amount to paisa (Khalti requires amount in paisa)
      const amountInPaisa = Math.round(amount * 100);

      // Initiate payment
      const response = await axios.post('http://localhost:3002/api/payments/initiate', {
        bookingId,
        amount: amountInPaisa,
        paymentMethod: 'khalti'
      });

      const { paymentUrl, paymentId } = response.data;

      // Open Khalti payment page in a new window
      const paymentWindow = window.open(paymentUrl, 'Khalti Payment', 'width=500,height=600');

      // Poll for payment status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`http://localhost:3002/api/payments/verify/${paymentId}`);
          const { status } = statusResponse.data;

          if (status === 'completed') {
            clearInterval(pollInterval);
            paymentWindow.close();
            onSuccess && onSuccess();
            navigate('/payment-success');
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            paymentWindow.close();
            onFailure && onFailure();
            setError('Payment failed. Please try again.');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
        }
      }, 3000);

      // Clean up interval if window is closed
      paymentWindow.onbeforeunload = () => {
        clearInterval(pollInterval);
      };

    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(error.response?.data?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="khalti-payment">
      <button 
        className="khalti-button" 
        onClick={handlePayment} 
        disabled={loading}
      >
        Pay with Khalti
      </button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default KhaltiPayment; 