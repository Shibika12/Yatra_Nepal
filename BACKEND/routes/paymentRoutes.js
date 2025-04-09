const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

// Khalti API configuration
const KHALTI_API_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// Initiate payment
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;

    // Validate required fields
    if (!amount || !orderId || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare payment data
    const paymentData = {
      public_key: process.env.KHALTI_PUBLIC_KEY,
      amount: amount, // Amount in paisa
      product_identity: orderId,
      product_name: 'Yatra Nepal Booking',
      product_url: 'https://yatranepal.com',
      callback_url: `${process.env.BACKEND_URL}/api/payment/verify`,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      }
    };

    // Make request to Khalti API
    const response = await axios.post(KHALTI_API_URL, paymentData, {
      headers: {
        'Authorization': `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Return the payment URL to the frontend
    res.json({ 
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx 
    });

  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Verify payment
router.post('/verify', async (req, res) => {
  try {
    const { pidx } = req.body;

    // Verify payment with Khalti
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Check payment status
    if (response.data.status === 'Completed') {
      // Update your database with payment status
      // TODO: Add your database update logic here

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router; 