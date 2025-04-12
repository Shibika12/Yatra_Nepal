import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('Current URL:', window.location.href);
        console.log('Search Params:', window.location.search);
        
        // Get the raw search string
        const searchString = window.location.search;
        
        // Extract the data parameter from the URL
        const dataMatch = searchString.match(/data=([^&]+)/);
        let paymentData = {};
        
        if (dataMatch) {
          try {
            // Decode the base64 data
            const decodedData = atob(dataMatch[1]);
            paymentData = JSON.parse(decodedData);
            console.log('Decoded eSewa data:', paymentData);
          } catch (decodeError) {
            console.error('Error decoding eSewa data:', decodeError);
          }
        }

        // Get transaction details from localStorage
        const storedTransaction = localStorage.getItem('currentTransaction');
        const transactionDetails = storedTransaction ? JSON.parse(storedTransaction) : null;
        
        console.log('Stored transaction details:', transactionDetails);

        // Prepare verification payload
        const verificationPayload = {
          transaction_uuid: paymentData.transaction_uuid || transactionDetails?.transaction_uuid,
          total_amount: paymentData.total_amount || transactionDetails?.total_amount,
          transaction_code: paymentData.transaction_code || transactionDetails?.transaction_code,
          refId: paymentData.refId || transactionDetails?.refId,
          source: 'esewa',
          data: paymentData // Include the full decoded data
        };

        console.log('Payment verification details:', verificationPayload);

        if (!verificationPayload.transaction_uuid || !verificationPayload.total_amount) {
          console.log('Transaction details not found, retrying...', { retryCount, maxRetries });
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            setTimeout(verifyPayment, 2000); // Retry after 2 seconds
            return;
          } else {
            throw new Error('Transaction details not found after multiple retries');
          }
        }

        // Verify payment with backend
        const response = await axios.post('http://localhost:3002/api/payments/verify', verificationPayload);
        console.log('Payment verification response:', response.data);

        if (response.data.success) {
          // Clear the stored transaction
          localStorage.removeItem('currentTransaction');
          
          // Emit payment confirmation event
          if (socket) {
            socket.emit('payment_confirmed', {
              userId: transactionDetails?.tourist_id,
              notification: {
                type: 'payment_success',
                message: 'Your payment has been confirmed!',
                data: {
                  amount: verificationPayload.total_amount,
                  transactionId: verificationPayload.transaction_uuid
                }
              }
            });
          }

          toast.success('Payment verified successfully!');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          throw new Error(response.data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.message);
        toast.error(err.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [navigate, socket, retryCount]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess; 