import express from 'express';
import { connectToDatabase } from '../lib/db.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Debug middleware specific to chat routes
router.use((req, res, next) => {
  console.log('[Chat Route]', req.method, req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Test route to verify chat router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Chat routes are working' });
});

// Debug route to test guide conversations
router.get('/guide/test', (req, res) => {
  res.json({ message: 'Guide conversations route is working' });
});

// Debug route to test guide conversations without authentication
router.get('/guide/conversations/test', async (req, res) => {
  console.log('Guide conversations test route hit');
  
  try {
    const db = await connectToDatabase();
    console.log('Fetching all conversations');

    const query = `
      SELECT DISTINCT 
        c.id,
        c.guide_id,
        c.tourist_id,
        u.name as tourist_name,
        (
          SELECT m2.message 
          FROM messages m2 
          WHERE m2.conversation_id = c.id 
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m3.created_at 
          FROM messages m3 
          WHERE m3.conversation_id = c.id 
          ORDER BY m3.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        0 as unread_count
      FROM conversations c
      JOIN users u ON c.tourist_id = u.user_id
      ORDER BY last_message_time DESC
    `;

    const [conversations] = await db.query(query);
    console.log('Found conversations:', conversations.length);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Create a new conversation or get existing one
router.post('/conversations/create', authenticateToken, async (req, res) => {
  console.log('Received request to create conversation');
  console.log('Request body:', req.body);
  console.log('User from token:', req.user);

  try {
    const { guide_id, message } = req.body;
    const tourist_id = req.user.userId; // From auth token

    if (!guide_id) {
      console.log('Missing guide_id in request');
      return res.status(400).json({ error: 'guide_id is required' });
    }

    if (!tourist_id) {
      console.log('Missing tourist_id from token');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Creating conversation:', { tourist_id, guide_id, message });

    const db = await connectToDatabase();
    
    // Check if conversation already exists
    const [existingConv] = await db.query(
      'SELECT id FROM conversations WHERE (tourist_id = ? AND guide_id = ?)',
      [tourist_id, guide_id]
    );

    let conversationId;

    if (existingConv.length > 0) {
      conversationId = existingConv[0].id;
      console.log('Found existing conversation:', conversationId);
    } else {
      // Create new conversation
      const [result] = await db.query(
        'INSERT INTO conversations (tourist_id, guide_id, created_at) VALUES (?, ?, NOW())',
        [tourist_id, guide_id]
      );
      conversationId = result.insertId;
      console.log('Created new conversation:', conversationId);

      // Add initial message if provided
      if (message) {
        await db.query(
          'INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?, NOW())',
          [conversationId, tourist_id, guide_id, message]
        );
        console.log('Added initial message to conversation');
      }
    }

    const response = { 
      id: conversationId,
      message: 'Conversation created/retrieved successfully' 
    };
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in conversation creation:', error);
    res.status(500).json({ error: 'Failed to create conversation', details: error.message });
  }
});

// Get all conversations for a tourist
router.get('/tourist/conversations', authenticateToken, async (req, res) => {
  const tourist_id = req.user.userId;
  
  try {
    const db = await connectToDatabase();
    console.log('Fetching conversations for tourist:', tourist_id);

    const query = `
      SELECT DISTINCT 
        c.id,
        c.guide_id,
        c.tourist_id,
        u.name as guide_name,
        (
          SELECT m2.message 
          FROM messages m2 
          WHERE m2.conversation_id = c.id 
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m3.created_at 
          FROM messages m3 
          WHERE m3.conversation_id = c.id 
          ORDER BY m3.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m4 
          WHERE m4.conversation_id = c.id 
          AND m4.receiver_id = ? 
          AND m4.is_read = 0
        ) as unread_count,
        u.guide_type
      FROM conversations c
      JOIN users u ON c.guide_id = u.user_id
      WHERE c.tourist_id = ?
      ORDER BY last_message_time DESC
    `;

    const [conversations] = await db.query(query, [tourist_id, tourist_id]);
    console.log('Found conversations:', conversations.length);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Get all conversations for a guide
router.get('/guide/conversations', authenticateToken, async (req, res) => {
  console.log('Guide conversations route hit');
  console.log('User from token:', req.user);
  
  const guide_id = req.user.userId;
  
  try {
    const db = await connectToDatabase();
    console.log('Fetching conversations for guide:', guide_id);

    const query = `
      SELECT DISTINCT 
        c.id,
        c.guide_id,
        c.tourist_id,
        u.name as tourist_name,
        (
          SELECT m2.message 
          FROM messages m2 
          WHERE m2.conversation_id = c.id 
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m3.created_at 
          FROM messages m3 
          WHERE m3.conversation_id = c.id 
          ORDER BY m3.created_at DESC 
          LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) 
          FROM messages m4 
          WHERE m4.conversation_id = c.id 
          AND m4.receiver_id = ? 
          AND m4.is_read = 0
        ) as unread_count
      FROM conversations c
      JOIN users u ON c.tourist_id = u.user_id
      WHERE c.guide_id = ?
      ORDER BY last_message_time DESC
    `;

    const [conversations] = await db.query(query, [guide_id, guide_id]);
    console.log('Found conversations:', conversations.length);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});

// Get messages for a specific conversation
router.get('/conversation/:conversationId/messages', authenticateToken, async (req, res) => {
  const { conversationId } = req.params;
  const user_id = req.user.userId;

  try {
    const db = await connectToDatabase();
    console.log('Fetching messages for conversation:', conversationId, 'user:', user_id);

    // Verify user has access to this conversation
    const [conversation] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (tourist_id = ? OR guide_id = ?)',
      [conversationId, user_id, user_id]
    );

    if (!conversation.length) {
      console.log('Access denied: User does not have access to this conversation');
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get messages
    const query = `
      SELECT 
        m.id as message_id,
        m.conversation_id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.is_read,
        m.created_at,
        u.name as sender_name,
        u.user_type as sender_type
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `;

    const [messages] = await db.query(query, [conversationId]);
    console.log('Found messages:', messages.length);

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND receiver_id = ?',
      [conversationId, user_id]
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Send a message
router.post('/message', authenticateToken, async (req, res) => {
  const { conversationId, message } = req.body;
  const sender_id = req.user.userId;

  try {
    const db = await connectToDatabase();
    console.log('Sending message in conversation:', conversationId);

    // Verify conversation exists and user has access
    const [conversation] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (tourist_id = ? OR guide_id = ?)',
      [conversationId, sender_id, sender_id]
    );

    if (!conversation.length) {
      console.log('Access denied: User does not have access to this conversation');
      return res.status(403).json({ message: 'Access denied' });
    }

    // Determine receiver_id based on sender's role
    const receiver_id = conversation[0].tourist_id === sender_id 
      ? conversation[0].guide_id 
      : conversation[0].tourist_id;

    // Insert message
    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at) VALUES (?, ?, ?, ?, NOW())',
      [conversationId, sender_id, receiver_id, message]
    );

    // Get the inserted message with sender details
    const [newMessage] = await db.query(
      `SELECT 
        m.id as message_id,
        m.conversation_id,
        m.sender_id,
        m.receiver_id,
        m.message,
        m.is_read,
        m.created_at,
        u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.id = ?`,
      [result.insertId]
    );

    console.log('Message sent successfully');
    res.json(newMessage[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

export default router;