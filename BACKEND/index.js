import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import touristRoutes from './routes/touristRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import pool from './lib/db.js';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = decoded.userId;
    socket.userRole = decoded.user_type;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId, 'Role:', socket.userRole);
  
  // Join user's room for private messages
  socket.join(socket.userId.toString());
  
  // If user is a guide, join guide-specific room
  if (socket.userRole === 'Guide') {
    socket.join(`guide_${socket.userId}`);
    console.log(`Guide ${socket.userId} joined guide room`);
  }

  // If user is an admin, join admin room
  if (socket.userRole === 'Admin') {
    socket.join('admin');
    console.log(`Admin ${socket.userId} joined admin room`);
  }

  // If user is a tourist, join tourist room
  if (socket.userRole === 'Tourist') {
    socket.join(`tourist_${socket.userId}`);
    socket.join('tourists'); // Join a general tourists room for broadcast notifications
    console.log(`Tourist ${socket.userId} joined tourist room and general tourists room`);
  }

  socket.on('join_admin', () => {
    if (socket.userRole === 'Admin') {
      socket.join('admin');
      console.log(`Admin ${socket.userId} joined admin room via join_admin event`);
    } else {
      console.log(`Non-admin user ${socket.userId} attempted to join admin room`);
    }
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, message, senderId, receiverId } = data;
      
      // Get sender's name
      const [senderResult] = await pool.query('SELECT name FROM users WHERE user_id = ?', [senderId]);
      const senderName = senderResult[0]?.name || 'Unknown User';
      
      // Create notification for receiver
      const [notificationResult] = await pool.query(
        'INSERT INTO notifications (user_id, type, content, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [receiverId, 'message', `New message from ${senderName}`, conversationId]
      );
      
      // Emit message to receiver's socket
      io.to(receiverId.toString()).emit('receive_message', {
        conversation_id: conversationId,
        message: message,
        sender_id: senderId,
        sender_name: senderName,
        created_at: new Date()
      });

      // Emit notification to receiver's socket
      io.to(receiverId.toString()).emit('new_notification', {
        id: notificationResult.insertId,
        type: 'message',
        content: `New message from ${senderName}`,
        reference_id: conversationId,
        created_at: new Date(),
        is_read: false
      });
      
    } catch (error) {
      // Keep error logging for critical errors
      console.error('Error handling message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Make io available to routes
app.set('io', io);

// Enable CORS for all routes
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Remove debug middleware
app.use((req, res, next) => {
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Register routes
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tourists', touristRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Add a test route for notifications
app.get('/api/notifications/test', (req, res) => {
  res.json({ message: 'Notifications route is working' });
});

// Debug route to test if server is responding
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Debug route to test if chat routes are working
app.get('/api/chat/test', (req, res) => {
  res.json({ message: 'Chat routes are working' });
});

// 404 handler
app.use((req, res) => {
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
    const PORT = process.env.PORT || 3002;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });