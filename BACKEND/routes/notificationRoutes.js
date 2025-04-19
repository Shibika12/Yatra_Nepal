import express from 'express';
import pool from '../lib/db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Remove debug middleware
router.use((req, res, next) => {
  next();
});

// Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.user_id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.user_id]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
});

// Get unread notifications count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.user_id]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread notifications count', error: error.message });
  }
});

// Create a new notification
router.post('/', authenticateToken, async (req, res) => {
  const { user_id, type, content, reference_id } = req.body;
  
  try {
    if (!user_id || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, type, content, reference_id) VALUES (?, ?, ?, ?)',
      [user_id, type, content, reference_id]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      user_id,
      type,
      content,
      reference_id
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Notification routes are working' });
});

// Mark notifications as read by type
router.put('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    const userId = req.user.id;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Notification type is required'
      });
    }

    const [result] = await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND type = ? AND is_read = 0',
      [userId, type]
    );

    console.log(`Marked ${result.affectedRows} ${type} notifications as read for user ${userId}`);

    res.json({
      success: true,
      message: `Marked ${result.affectedRows} notifications as read`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

// Update existing payment notifications
router.post('/update-payment-notifications', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE notifications 
       SET content = CONCAT('Thank you! Your payment of NPR ', 
                          SUBSTRING_INDEX(SUBSTRING_INDEX(content, 'NPR ', -1), ' has', 1),
                          ' has been completed. Your booking has been confirmed.')
       WHERE type = 'payment' AND content LIKE '%Your payment of NPR%has been confirmed%'`
    );
    
    res.json({ 
      success: true,
      message: `Updated ${result.affectedRows} notifications`,
      affectedRows: result.affectedRows
    });
  } catch (error) {
    console.error('Error updating payment notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update notifications',
      error: error.message 
    });
  }
});

export default router; 