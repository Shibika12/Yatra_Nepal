import jwt from 'jsonwebtoken';
import pool from '../lib/db.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    // Use user_id if available, otherwise use userId
    const userId = decoded.user_id || decoded.userId;
    
    if (!userId) {
      console.error('No user ID found in token');
      return res.status(403).json({ message: 'Invalid token: no user ID' });
    }

    // Get user from database to verify role
    const [users] = await pool.query(
      'SELECT user_id, user_type, is_admin FROM users WHERE user_id = ?',
      [userId]
    );

    if (!users.length) {
      console.error('User not found in database');
      return res.status(403).json({ message: 'User not found' });
    }

    const user = users[0];

    req.user = {
      id: user.user_id,
      user_id: user.user_id,
      userId: user.user_id,
      user_type: user.user_type,
      is_admin: user.user_type === 'Admin'
    };
    
    console.log('Set user object:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateToken; 