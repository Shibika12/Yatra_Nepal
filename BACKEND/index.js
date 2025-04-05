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

const app = express();
const server = createServer(app);

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`conversation_${data.conversationId}`).emit('receive_message', data);
    console.log(`Message sent in conversation ${data.conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Debug middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
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
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
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
    const PORT = process.env.PORT || 3002;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Log all registered routes
      console.log('\nRegistered routes:');
      app._router.stack.forEach(r => {
        if (r.route && r.route.path) {
          console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
        } else if (r.name === 'router') {
          console.log(`Router: ${r.regexp}`);
        }
      });
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });