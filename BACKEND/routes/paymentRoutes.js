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
      failure_url,
      guide_id
    } = req.body;

    // Generate unique transaction ID
    const transaction_uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Create payment record
    const query = `
      INSERT INTO payments (
        user_id,
        guide_id,
        transaction_id,
        amount,
        payment_method,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    await pool.query(query, [
      req.user.id,
      guide_id,
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

    // Emit socket event for new payment
    req.app.get('io').emit('new_payment_added');
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
    const { transaction_uuid, refId, status, total_amount } = req.body;

    // Start transaction
    await connection.beginTransaction();

    // Get payment details and check if already processed
    const [payments] = await connection.query(
      'SELECT p.*, n.id as notification_id FROM payments p ' +
      'LEFT JOIN notifications n ON n.reference_id = p.id AND n.user_id = p.user_id AND n.type = "payment" ' +
      'WHERE p.transaction_id = ?',
      [transaction_uuid]
    );

    if (payments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = payments[0];

    // If notification already exists, payment was already processed
    if (payment.notification_id) {
      await connection.rollback();
      console.log('Payment already processed - notification exists');
      return res.json({
        success: true,
        message: 'Payment already processed',
        payment
      });
    }

    // Check if booking already exists
    const [existingBookings] = await connection.query(
      'SELECT id FROM bookings WHERE transaction_id = ?',
      [transaction_uuid]
    );

    if (existingBookings.length > 0) {
      await connection.rollback();
      console.log('Booking already exists');
      return res.json({
        success: true,
        message: 'Payment already processed',
        payment
      });
    }

    // Update payment status
    const newStatus = status === 'COMPLETE' ? 'completed' : 'failed';
    
    try {
      // Update payment status
      await connection.query(
        'UPDATE payments SET status = ?, transaction_code = ?, updated_at = NOW() WHERE transaction_id = ?',
        [newStatus, refId, transaction_uuid]
      );

      if (newStatus === 'completed') {
        // Create booking record with INSERT IGNORE to prevent duplicates
        const [bookingResult] = await connection.query(`
          INSERT IGNORE INTO bookings (
            guide_id,
            tourist_id,
            booking_date,
            amount,
            transaction_id,
            payment_method,
            status,
            payment_status,
            is_read,
            created_at
          ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, 0, NOW())
        `, [
          payment.guide_id,
          payment.user_id,
          total_amount,
          transaction_uuid,
          'esewa',
          'completed',
          'completed'
        ]);

        // Check if booking was actually created
        if (bookingResult.affectedRows === 0) {
          console.log('Booking already exists, skipping notification creation');
          await connection.commit();
          return res.json({
            success: true,
            message: 'Payment already processed',
            payment
          });
        }

        // Create notifications with INSERT IGNORE to prevent duplicates
        // Tourist notification
        const [touristNotification] = await connection.query(
          'INSERT IGNORE INTO notifications (user_id, type, content, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())',
          [
            payment.user_id,
            'payment',
            `Thank you! Your payment of NPR ${total_amount} has been completed. Your booking has been confirmed.`,
            payment.id
          ]
        );

        // Guide notification
        const [guideNotification] = await connection.query(
          'INSERT IGNORE INTO notifications (user_id, type, content, reference_id, created_at, is_read) VALUES (?, ?, ?, ?, NOW(), 0)',
          [
            payment.guide_id,
            'booking',
            `New booking received! Amount: NPR ${total_amount}`,
            bookingResult.insertId
          ]
        );

        // Admin notification
        const [adminNotification] = await connection.query(
          'INSERT IGNORE INTO notifications (user_id, type, content, reference_id, created_at, is_read) VALUES (?, ?, ?, ?, NOW(), 0)',
          [
            29, // Admin user ID
            'payment',
            `New payment of NPR ${total_amount} received. The booking has been confirmed.`,
            payment.id
          ]
        );

        // Emit socket notifications only if notifications were actually created
        const io = req.app.get('io');
        if (io) {
          // Only emit if the notification was actually inserted
          if (touristNotification.affectedRows > 0) {
            io.to(`user_${payment.user_id}`).emit('new_notification', {
              type: 'payment',
              content: `Thank you! Your payment of NPR ${total_amount} has been completed. Your booking has been confirmed.`,
              created_at: new Date()
            });
          }

          if (guideNotification.affectedRows > 0) {
            io.to(`user_${payment.guide_id}`).emit('new_notification', {
              id: guideNotification.insertId,
              type: 'booking',
              content: `New booking received! Amount: NPR ${total_amount}`,
              reference_id: bookingResult.insertId,
              created_at: new Date(),
              is_read: false,
              notification_type: 'booking'
            });
          }

          if (adminNotification.affectedRows > 0) {
            io.to('admin').emit('new_notification', {
              id: adminNotification.insertId,
              type: 'payment',
              content: `New payment of NPR ${total_amount} received. The booking has been confirmed.`,
              reference_id: payment.id,
              created_at: new Date(),
              is_read: false
            });
          }
        }

        await connection.commit();
        res.json({
          success: true,
          message: 'Payment completed and booking created',
          payment: payment,
          booking: bookingResult
        });
      } else {
        await connection.commit();
        res.json({
          success: false,
          message: 'Payment failed',
          payment: payment
        });
      }
    } catch (error) {
      await connection.rollback();
      console.error('Error processing payment:', error);
      throw error;
    }
  } catch (error) {
    await connection.rollback();
    console.error('Error in payment verification:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
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

// Check if payment has already been processed
router.get('/check-status/:transaction_uuid', authenticateToken, async (req, res) => {
  try {
    const { transaction_uuid } = req.params;
    
    // Check if payment exists and has notifications
    const [payments] = await pool.query(
      'SELECT p.*, n.id as notification_id FROM payments p ' +
      'LEFT JOIN notifications n ON n.reference_id = p.id AND n.user_id = p.user_id AND n.type = "payment" ' +
      'WHERE p.transaction_id = ?',
      [transaction_uuid]
    );
    
    if (payments.length === 0) {
      return res.json({
        verified: false,
        message: 'Payment not found'
      });
    }
    
    const payment = payments[0];
    
    // Check if booking exists
    const [bookings] = await pool.query(
      'SELECT id FROM bookings WHERE transaction_id = ?',
      [transaction_uuid]
    );
    
    if (payment.notification_id || bookings.length > 0) {
      return res.json({
        verified: true,
        message: 'Payment already processed',
        payment: {
          id: payment.id,
          status: payment.status,
          transaction_id: payment.transaction_id
        }
      });
    }
    
    return res.json({
      verified: false,
      message: 'Payment not yet processed',
      payment: {
        id: payment.id,
        status: payment.status,
        transaction_id: payment.transaction_id
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      verified: false, 
      message: 'Failed to check payment status',
      error: error.message
    });
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
    // Verify admin status
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const [payments] = await pool.query(`
      SELECT 
        p.transaction_id,
        p.amount,
        p.payment_method,
        p.status,
        p.created_at,
        u1.name as tourist_name,
        u2.name as guide_name
      FROM payments p
      LEFT JOIN Users u1 ON p.user_id = u1.user_id
      LEFT JOIN Users u2 ON p.guide_id = u2.user_id
      ORDER BY p.created_at DESC
    `);

    console.log('Fetched payments:', payments); // Debug log
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

export default router; 