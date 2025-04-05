import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  console.log('Authentication middleware hit');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('Token:', token ? 'Token present' : 'No token');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token decoded successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export default authenticateToken; 