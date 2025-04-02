import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// Get tourist profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user details if they are a tourist
    const [users] = await pool.query(
      'SELECT user_id, name, email, nationality, phone_number FROM Users WHERE user_id = ? AND user_type = "Tourist"',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'Tourist not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching tourist profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tourist profile
router.put('/profile/:userId', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const { userId } = req.params;
    const { name, email, phone_number, nationality } = req.body;

    await connection.beginTransaction();

    // Check if user exists and is a tourist
    const [users] = await connection.query(
      'SELECT user_id FROM Users WHERE user_id = ? AND user_type = "Tourist"',
      [userId]
    );

    if (!users || users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Tourist not found' });
    }

    // Update user information
    await connection.query(
      'UPDATE Users SET name = ?, email = ?, phone_number = ?, nationality = ? WHERE user_id = ?',
      [name, email, phone_number, nationality, userId]
    );

    await connection.commit();

    // Fetch and return updated profile
    const [updatedProfile] = await connection.query(
      'SELECT user_id, name, email, nationality, phone_number FROM Users WHERE user_id = ?',
      [userId]
    );

    res.json(updatedProfile[0]);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating tourist profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router; 