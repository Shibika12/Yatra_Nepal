import express from 'express';
import { pool } from '../config/db.js';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth.js';
import CryptoJS from 'crypto-js';
import crypto from 'crypto';

const router = express.Router();

// eSewa configuration
const ESEWA_MERCHANT_CODE = 'EPAYTEST';  // Test merchant code
const ESEWA_SECRET_KEY = '8gBm/:&EnhH.1/q';  // Test secret key
const ESEWA_API_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';  // Test API URL

// Create eSewa payment
router.post('/esewa/create', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      tax_amount,
      total_amount,
      product_name,
      success_url,
      failure_url
    } = req.body;

    // Generate unique transaction ID
    const transaction_uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Create payment record
    const query = `
      INSERT INTO payments (
        user_id,
        transaction_id,
        amount,
        payment_method,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())
    `;

    await pool.query(query, [
      req.user.id,
      transaction_uuid,
      total_amount,
      'esewa',
      'pending'
    ]);

    // Create eSewa payment data
    const esewaData = {
      amount: String(amount),
      tax_amount: String(tax_amount),
      total_amount: String(total_amount),
      transaction_uuid: transaction_uuid,
      product_code: "EPAYTEST",
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: success_url,
      failure_url: failure_url,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      product_name: product_name || "Guide Booking"
    };

    // Generate signature according to eSewa documentation
    const message = `total_amount=${esewaData.total_amount},transaction_uuid=${esewaData.transaction_uuid},product_code=${esewaData.product_code}`;

    // Generate signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', ESEWA_SECRET_KEY)
      .update(message)
      .digest('base64');

    esewaData.signature = signature;

    console.log('eSewa payment data:', {
      ...esewaData,
      message,
      signature: signature.substring(0, 10) + '...' // Log partial signature for security
    });

    // Return form data
    res.json({
      success: true,
      formData: {
        action: ESEWA_API_URL,
        method: 'POST',
        fields: esewaData
      }
    });
  } catch (error) {
    console.error('Error creating eSewa payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

// Verify eSewa payment
router.post('/esewa/verify', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { transaction_uuid, transaction_code, status, total_amount, refId } = req.body;
    
    console.log('Received verification request:', {
      transaction_uuid,
      transaction_code,
      status,
      total_amount,
      refId,
      userId: req.user.id
    });

    // Validate required fields
    if (!transaction_uuid) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction_uuid'
      });
    }

    await connection.beginTransaction();

    // Find the payment record
    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [transaction_uuid]
    );

    console.log('Found payments:', payments);

    if (!payments.length) {
      await connection.rollback();
      console.log('Payment not found:', transaction_uuid);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    const payment = payments[0];
    console.log('Found payment:', payment);

    // Check if payment is already processed
    if (payment.status !== 'pending') {
      await connection.rollback();
      console.log('Payment already processed:', {
        transaction_uuid,
        currentStatus: payment.status
      });
      return res.json({
        success: true,
        message: `Payment already ${payment.status}`,
        payment
      });
    }

    // Update payment status
    const newStatus = status === 'COMPLETE' ? 'completed' : 'failed';
    
    try {
      // Update payment status - only update status and updated_at
      const [result] = await connection.query(
        `UPDATE payments 
         SET status = ?, 
             updated_at = NOW() 
         WHERE transaction_id = ? 
         AND status = 'pending'`,
        [newStatus, transaction_uuid]
      );

      console.log('Update result:', result);

      if (result.affectedRows === 0) {
        await connection.rollback();
        console.log('No rows updated:', {
          transaction_uuid,
          newStatus
        });
        return res.status(400).json({
          success: false,
          message: 'Failed to update payment status'
        });
      }

      // Get the updated payment record
      const [updatedPayments] = await connection.query(
        'SELECT * FROM payments WHERE transaction_id = ?',
        [transaction_uuid]
      );

      const updatedPayment = updatedPayments[0];
      console.log('Updated payment:', updatedPayment);

      // If this is a guide booking payment, update the booking status
      if (payment.booking_id) {
        await connection.query(
          'UPDATE bookings SET payment_status = ? WHERE id = ?',
          [newStatus, payment.booking_id]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: `Payment ${newStatus}`,
        payment: updatedPayment
      });
    } catch (dbError) {
      await connection.rollback();
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error verifying eSewa payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    connection.release();
  }
});

// Check payment status
router.get('/esewa/status', authenticateToken, async (req, res) => {
  try {
    const { transaction_uuid, total_amount } = req.query;
    const user_id = req.user.id;

    // Check payment status with eSewa
    const response = await axios.get(
      `${process.env.NODE_ENV === 'production' 
        ? 'https://epay.esewa.com.np/api/epay/transaction/status/'
        : 'https://rc.esewa.com.np/api/epay/transaction/status/'}?product_code=${ESEWA_MERCHANT_CODE}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`
    );

    // Update payment status in database
    if (response.data.status === 'COMPLETE') {
      await pool.query(
        'UPDATE payments SET payment_status = ?, transaction_code = ?, updated_at = NOW() WHERE transaction_uuid = ? AND user_id = ?',
        ['completed', response.data.ref_id, transaction_uuid, user_id]
      );
    }

    res.json({
      success: true,
      status: response.data.status,
      ref_id: response.data.ref_id
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ success: false, message: 'Failed to check payment status' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
});

export default router; 