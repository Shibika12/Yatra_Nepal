import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', user);
    
    // Use user_id if available, otherwise use userId
    const userId = user.user_id || user.userId;
    
    if (!userId) {
      console.error('No user ID found in token');
      return res.status(403).json({ message: 'Invalid token: no user ID' });
    }

    req.user = { 
      userId: userId,
      user_id: userId, // Include both for compatibility
      role: user.role,
      is_admin: user.is_admin
    };
    
    console.log('Set user object:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateToken; 