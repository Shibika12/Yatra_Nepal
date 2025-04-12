import express from 'express';
import pool from '../lib/db.js';
import axios from 'axios';
import authenticateToken from '../middleware/authenticateToken.js';
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

    // Find the payment record with user details
    const [payments] = await connection.query(
      `SELECT p.*, u.name as user_name, u.user_id 
       FROM payments p 
       JOIN users u ON p.user_id = u.user_id 
       WHERE p.transaction_id = ?`,
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
    console.log('Found payment:', {
      ...payment,
      user_name: payment.user_name,
      user_id: payment.user_id
    });

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
      console.log('Updating payment status:', {
        newStatus,
        transaction_code: transaction_code || refId,
        transaction_uuid
      });

      // Update payment status
      const [updateResult] = await connection.query(
        'UPDATE payments SET status = ?, transaction_code = ?, updated_at = NOW() WHERE transaction_id = ?',
        [newStatus, transaction_code || refId, transaction_uuid]
      );

      console.log('Payment status updated:', updateResult);

      // Get updated payment details
      const [updatedPayments] = await connection.query(
        'SELECT * FROM payments WHERE transaction_id = ?',
        [transaction_uuid]
      );
      const updatedPayment = updatedPayments[0];

      // Create notification for tourist
      console.log('Creating notification for user:', payment.user_id);
      
      const [touristNotificationResult] = await connection.query(
        'INSERT INTO notifications (user_id, type, content, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [payment.user_id, 'payment', `Your payment of NPR ${total_amount} has been confirmed`, payment.id]
      );

      console.log('Notification created:', touristNotificationResult);

      // Get the io instance from the app
      const io = req.app.get('io');
      
      if (io) {
        // Emit to tourist's personal room
        const touristNotification = {
          id: touristNotificationResult.insertId,
          type: 'payment',
          content: `Your payment of NPR ${total_amount} has been confirmed`,
          reference_id: payment.id,
          created_at: new Date(),
          is_read: false
        };

        // Emit admin notification
        const adminNotification = {
          type: 'payment',
          content: `New payment of NPR ${total_amount} received from ${payment.user_name}`,
          payment_id: payment.id,
          amount: total_amount,
          user_name: payment.user_name,
          created_at: new Date(),
          is_read: false
        };

        console.log('Emitting notification to tourist:', {
          userId: payment.user_id,
          notification: touristNotification,
          rooms: [`tourist_${payment.user_id}`, payment.user_id.toString()]
        });

        // Emit to both user_id and tourist_userId rooms
        io.to(payment.user_id.toString()).emit('new_notification', touristNotification);
        io.to(`tourist_${payment.user_id}`).emit('new_notification', touristNotification);
        
        // Emit to admin room
        console.log('Emitting payment notification to admin room');
        io.to('admin').emit('new_payment', adminNotification);
        
        // Also emit a direct notification to the user's socket
        io.emit('payment_confirmed', {
          userId: payment.user_id,
          notification: touristNotification
        });
      } else {
        console.error('Socket.io instance not found in app');
      }

      await connection.commit();
      console.log('Transaction committed successfully');

      res.json({
        success: true,
        message: `Payment ${newStatus}`,
        payment: updatedPayment,
        notification: {
          id: touristNotificationResult.insertId,
          type: 'payment',
          content: `Your payment of NPR ${total_amount} has been confirmed`
        }
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

// Get all payments (admin only)
router.get('/admin/payments', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user_type !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Get all payments with user information
    const [payments] = await pool.query(
      `SELECT 
        p.*,
        u.name as user_name,
        u.email as user_email
      FROM payments p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC`
    );

    // Mark notifications as read
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND type = "payment"',
      [req.user.id]
    );

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error fetching admin payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

export default router; 