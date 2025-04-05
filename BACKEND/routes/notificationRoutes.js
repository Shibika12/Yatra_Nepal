import express from 'express';
import pool from '../lib/db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Debug middleware for notification routes
router.use((req, res, next) => {
  console.log('Notification route hit:', req.method, req.url);
  console.log('Headers:', req.headers);
  next();
});

// Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Getting notifications for user:', req.user);
    console.log('User ID from token:', req.user.userId);
    
    if (!req.user || !req.user.userId) {
      console.error('No user ID in token');
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    console.log('Raw notifications from DB:', rows);
    console.log(`Found ${rows.length} notifications for user ${req.user.userId}`);
    
    // Check if notifications have the expected structure
    if (rows.length > 0) {
      console.log('Sample notification structure:', {
        id: rows[0].id,
        user_id: rows[0].user_id,
        type: rows[0].type,
        content: rows[0].content,
        is_read: rows[0].is_read,
        created_at: rows[0].created_at
      });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    console.log('Marking notification as read:', req.params.id);
    console.log('User:', req.user);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Invalid user token' });
    }

    const [result] = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Create a new notification
router.post('/', authenticateToken, async (req, res) => {
  const { user_id, type, content, reference_id } = req.body;
  
  try {
    console.log('Creating notification:', { user_id, type, content, reference_id });

    if (!user_id || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, type, content, reference_id) VALUES (?, ?, ?, ?)',
      [user_id, type, content, reference_id]
    );
    
    console.log('Created notification:', result);
    res.status(201).json({ 
      id: result.insertId,
      user_id,
      type,
      content,
      reference_id
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Notification routes are working' });
});

export default router; 