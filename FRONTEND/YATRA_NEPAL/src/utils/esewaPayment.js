import CryptoJS from 'crypto-js';
import axios from 'axios';

/**
 * Generates a signature for eSewa payment
 * @param {string} message - The message to sign
 * @param {string} secretKey - The secret key for signing
 * @returns {string} - The base64 encoded signature
 */
export const generateEsewaSignature = (message, secretKey) => {
  // Use HmacSHA256 for signature generation
  const hash = CryptoJS.HmacSHA256(message, secretKey);
  // Convert to Base64
  return CryptoJS.enc.Base64.stringify(hash);
};

/**
 * Submits a payment to eSewa
 * @param {Object} paymentDetails - Payment details including amount and metadata
 * @param {string} productName - Name of the product/service
 * @param {string} productId - Unique identifier for the product
 * @param {Function} onSuccess - Callback function for successful payment
 * @param {Function} onError - Callback function for failed payment
 */
export const submitEsewaPayment = async (paymentDetails, productName) => {
  try {
    const baseUrl = window.location.origin;
    
    // Ensure amounts are strings with 2 decimal places and no commas
    const formatAmount = (amount) => {
      // Remove any commas and convert to number
      const num = Number(String(amount).replace(/,/g, ''));
      // Format with 2 decimal places and ensure it's a string
      return num.toFixed(2);
    };
    
    // Prepare the payload
    const payload = {
      amount: formatAmount(paymentDetails.amount),
      tax_amount: formatAmount(paymentDetails.taxAmount || 0),
      total_amount: formatAmount(paymentDetails.totalAmount),
      product_name: productName || 'Guide Booking',
      success_url: `${baseUrl}/payment-success?source=esewa`,
      failure_url: `${baseUrl}/payment-failure?source=esewa`
    };

    console.log('Preparing eSewa payment with payload:', {
      ...payload,
      formattedAmounts: {
        amount: payload.amount,
        tax_amount: payload.tax_amount,
        total_amount: payload.total_amount
      }
    });

    // Get the form data from backend
    const response = await axios.post(
      'http://localhost:3002/api/payments/esewa/create',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.success || !response.data.formData) {
      throw new Error('Invalid response from server');
    }

    const { action, method, fields } = response.data.formData;

    // Store transaction details in localStorage for verification
    const transactionDetails = {
      transaction_uuid: fields.transaction_uuid,
      total_amount: fields.total_amount,
      timestamp: Date.now()
    };
    localStorage.setItem('esewa_transaction', JSON.stringify(transactionDetails));

    // Create and submit form
    const form = document.createElement('form');
    form.setAttribute('method', method);
    form.setAttribute('action', action);
    form.setAttribute('style', 'display: none;');

    // Add fields in the exact order expected by eSewa
    const fieldOrder = [
      'amount',
      'tax_amount',
      'total_amount',
      'transaction_uuid',
      'product_code',
      'product_service_charge',
      'product_delivery_charge',
      'success_url',
      'failure_url',
      'signed_field_names',
      'signature',
      'product_name'
    ];

    // Add fields in the specified order
    fieldOrder.forEach(key => {
      if (key in fields) {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', key);
        // Ensure the value is a string and properly trimmed
        const value = String(fields[key] || '').trim();
        input.setAttribute('value', value);
        form.appendChild(input);
      }
    });

    // Log form data before submission (mask sensitive data)
    console.log('Submitting to eSewa:', {
      action,
      method,
      fields: {
        ...fields,
        signature: fields.signature.substring(0, 10) + '...',
        success_url: fields.success_url,
        failure_url: fields.failure_url,
        transaction_uuid: fields.transaction_uuid
      }
    });

    // Add form to body and submit
    document.body.appendChild(form);
    form.submit();

    // Remove form after submission
    setTimeout(() => {
      document.body.removeChild(form);
    }, 100);

    return true;
  } catch (error) {
    console.error('Error in submitEsewaPayment:', error);
    if (error.response) {
      console.error('Server error response:', error.response.data);
    }
    throw error;
  }
};

/**
 * Verifies an eSewa payment with the backend
 * @param {Object} data - Payment data from eSewa
 * @returns {Promise} - Resolves with verification result
 */
export const verifyEsewaPayment = async (data) => {
  try {
    console.log('Verifying eSewa payment:', {
      ...data,
      signature: data.signature ? data.signature.substring(0, 10) + '...' : undefined
    });

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const verificationData = {
      transaction_uuid: data.transaction_uuid,
      transaction_code: data.transaction_code,
      status: data.status,
      total_amount: data.total_amount,
      refId: data.refId
    };

    const response = await axios.post(
      'http://localhost:3002/api/payments/esewa/verify',
      verificationData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Payment verification response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Payment verification failed');
    }

    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    if (error.response) {
      console.error('Server error response:', error.response.data);
    }
    throw error;
  }
};

/**
 * Checks the status of an eSewa payment
 * @param {string} transaction_uuid - The transaction UUID
 * @param {string} total_amount - The total amount of the payment
 * @returns {Promise} - Resolves with payment status
 */
export const checkEsewaPaymentStatus = async (transaction_uuid, total_amount) => {
  try {
    console.log('Checking payment status for:', { transaction_uuid, total_amount });

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(
      `http://localhost:3002/api/payments/esewa/status?transaction_uuid=${transaction_uuid}&total_amount=${total_amount}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('Payment status response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to check payment status');
    }

    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    if (error.response) {
      console.error('Server error response:', error.response.data);
    }
    throw error;
  }
}; 