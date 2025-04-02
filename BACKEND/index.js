import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import touristRoutes from './routes/touristRoutes.js';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Register routes
app.use('/api/admin', adminRoutes);
console.log('Admin routes registered at /api/admin');

app.use('/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tourists', touristRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server after database connection
connectToDatabase()
  .then(() => {
    console.log('Connected to database successfully');
    const PORT = 3002;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Available routes:');
      console.log('- /api/admin/*');
      console.log('- /auth/*');
      console.log('- /api/guides/*');
      console.log('- /api/blogs/*');
      console.log('- /api/tourists/*');
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });