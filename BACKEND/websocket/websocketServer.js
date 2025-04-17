import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from '../lib/db.js';

const setupWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Store active connections
  const activeUsers = new Map();

  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;
    const userType = socket.handshake.auth.userType;

    console.log('Socket auth attempt:', { 
      hasToken: !!token, 
      userId, 
      userType 
    });

    if (!token || !userId || !userType) {
      console.log('Missing auth data:', { 
        hasToken: !!token, 
        userId, 
        userType 
      });
      return next(new Error('Authentication error: Missing required data'));
    }

    try {
      // Use the same secret key as in authenticateToken.js
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      console.log('Using JWT secret:', secret ? 'Secret is set' : 'No secret found');
      
      const decoded = jwt.verify(token, secret);
      console.log('Token decoded:', decoded);
      
      // Check if the token contains either user_id or userId
      const tokenUserId = decoded.user_id || decoded.userId;
      
      if (!tokenUserId) {
        console.log('No user ID found in token');
        return next(new Error('Authentication error: No user ID in token'));
      }
      
      // Verify that the token's userId matches the provided userId
      if (tokenUserId !== userId) {
        console.log('Token userId mismatch:', { 
          tokenUserId, 
          providedUserId: userId 
        });
        return next(new Error('Authentication error: User ID mismatch'));
      }

      socket.userId = userId;
      socket.userType = userType;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Store user connection
    activeUsers.set(socket.userId, socket.id);

    // Join admin room if user is admin
    if (socket.userType === 'Admin') {
      console.log(`Admin user ${socket.userId} joining admin room`);
      socket.join('admin');
    }
    
    // Join tourist-specific room if user is tourist
    if (socket.userType === 'Tourist') {
      socket.join(`tourist_${socket.userId}`);
      console.log(`User ${socket.userId} joined tourist room: tourist_${socket.userId}`);
    }

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, message, receiverId } = data;
        const senderId = socket.userId;

        // Verify conversation access
        const [conversation] = await pool.query(
          'SELECT * FROM conversations WHERE id = ? AND (tourist_id = ? OR guide_id = ?)',
          [conversationId, senderId, senderId]
        );

        if (!conversation.length) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Insert message into database
        const [result] = await pool.query(
          'INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?, NOW())',
          [conversationId, senderId, receiverId, message]
        );

        // Get message with sender details
        const [newMessage] = await pool.query(
          `SELECT m.*, u.name as sender_name, u.profile_picture as sender_profile_picture
           FROM messages m
           JOIN users u ON m.sender_id = u.id
           WHERE m.id = ?`,
          [result.insertId]
        );

        // Emit to sender and receiver
        io.to(`tourist_${senderId}`).emit('receive_message', newMessage[0]);
        io.to(`tourist_${receiverId}`).emit('receive_message', newMessage[0]);

        // Update conversation last message
        await pool.query(
          'UPDATE conversations SET last_message = ?, last_message_time = NOW() WHERE id = ?',
          [message, conversationId]
        );

        // Create notification for the receiver
        const [senderResult] = await pool.query(
          'SELECT name FROM users WHERE id = ?',
          [senderId]
        );
        
        const senderName = senderResult[0]?.name || 'Unknown User';
        
        // Create notification
        await pool.query(
          'INSERT INTO notifications (user_id, type, content, reference_id) VALUES (?, ?, ?, ?)',
          [receiverId, 'message', `New message from ${senderName}`, conversationId]
        );

        console.log(`Created notification for user ${receiverId} about message from ${senderName}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Handle read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.userId;

        await pool.query(
          'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND receiver_id = ?',
          [conversationId, userId]
        );

        // Notify the sender that their messages were read
        const [conversation] = await pool.query(
          'SELECT * FROM conversations WHERE id = ?',
          [conversationId]
        );

        if (conversation.length) {
          const senderId = conversation[0].tourist_id === userId 
            ? conversation[0].guide_id 
            : conversation[0].tourist_id;

          io.to(`tourist_${senderId}`).emit('messages_read', {
            conversationId,
            readBy: userId
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, receiverId } = data;
      io.to(`tourist_${receiverId}`).emit('user_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('stop_typing', (data) => {
      const { conversationId, receiverId } = data;
      io.to(`tourist_${receiverId}`).emit('user_stop_typing', {
        conversationId,
        userId: socket.userId
      });
    });
    
    // Handle fetch notifications event
    socket.on('fetch_notifications', () => {
      console.log(`User ${socket.userId} requested to fetch notifications`);
      // This is just a trigger for the frontend to fetch notifications
      // The actual fetching happens in the frontend
    });
    
    // Handle payment confirmation
    socket.on('payment_confirmed', (data) => {
      console.log('Payment confirmation received:', data);
      const { userId, notification } = data;
      
      // Emit to the specific user
      io.to(`tourist_${userId}`).emit('new_notification', notification);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      activeUsers.delete(socket.userId);
    });
  });

  return io;
};

export default setupWebSocket; 