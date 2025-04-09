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
    // Check for both userId and user_id
    const userId = req.user.userId || req.user.user_id;
    console.log('Fetching notifications for user:', userId);
    console.log('User object:', req.user);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    console.log('Found notifications:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error in notifications route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.user_id;
    console.log('Marking notification as read for user:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const [result] = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
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

export default router; 