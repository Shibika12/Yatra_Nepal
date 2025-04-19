import express from 'express';
import pool from '../lib/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Configure multer for profile picture uploads
const uploadDir = 'uploads/guide-profiles';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
        }
    }
}).single('profile_pic');

// Get guide profile
router.get('/guide-profile/:userId', async (req, res) => {
    try {
        const [user] = await pool.query(
            `SELECT u.user_id, u.name, u.email, u.nationality, u.phone_number, 
                    u.created_at, u.is_admin, u.is_verified, u.guide_type,
                    g.profile_pic, g.years_of_experience, g.languages, g.about, g.specialization
             FROM Users u 
             LEFT JOIN guides g ON u.user_id = g.user_id 
             WHERE u.user_id = ? AND u.user_type = 'Guide'`,
            [req.params.userId]
        );

        if (!user.length) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        res.json(user[0]);
    } catch (error) {
        console.error('Error fetching guide profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update guide profile
router.put('/guide-profile/:userId', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: err.message });
        }

        const connection = await pool.getConnection();
        try {
            const {
                name,
                phone_number,
                years_of_experience,
                languages,
                about,
                specialization
            } = req.body;

            const userId = req.params.userId;

            // Begin transaction
            await connection.beginTransaction();

            // Update user table with basic info
            if (name || phone_number) {
                const updateUserQuery = 'UPDATE Users SET ? WHERE user_id = ?';
                const updateUserData = {};
                if (name) updateUserData.name = name;
                if (phone_number) updateUserData.phone_number = phone_number;
                await connection.query(updateUserQuery, [updateUserData, userId]);
            }

            // Check if guide exists
            const [existingGuide] = await connection.query(
                'SELECT * FROM guides WHERE user_id = ?',
                [userId]
            );

            // Prepare guide data
            const guideData = {};
            if (years_of_experience) guideData.years_of_experience = years_of_experience;
            if (languages) guideData.languages = languages;
            if (about) guideData.about = about;
            if (specialization) guideData.specialization = specialization;
            if (req.file) guideData.profile_pic = req.file.path;

            if (existingGuide.length > 0) {
                // Update existing guide
                if (Object.keys(guideData).length > 0) {
                    await connection.query('UPDATE guides SET ? WHERE user_id = ?', [guideData, userId]);
                }
            } else {
                // Create new guide entry
                await connection.query(
                    'INSERT INTO guides SET ?',
                    { ...guideData, user_id: userId }
                );
            }

            await connection.commit();

            // Fetch and return updated profile
            const [updatedProfile] = await connection.query(
                `SELECT u.user_id, u.name, u.email, u.nationality, u.phone_number, 
                        u.created_at, u.is_admin, u.is_verified, u.guide_type,
                        g.profile_pic, g.years_of_experience, g.languages, g.about, g.specialization
                 FROM Users u 
                 LEFT JOIN guides g ON u.user_id = g.user_id 
                 WHERE u.user_id = ?`,
                [userId]
            );

            res.json(updatedProfile[0]);

        } catch (error) {
            await connection.rollback();
            console.error('Error updating guide profile:', error);
            res.status(500).json({ message: 'Server error', error: error.message });
        } finally {
            connection.release();
        }
    });
});

// Get guide reviews
router.get('/reviews/:guideId', async (req, res) => {
    try {
        console.log('Fetching reviews for guide user_id:', req.params.guideId);
        
        // First check if the user exists and is a guide
        const userCheckQuery = 'SELECT user_id, user_type FROM Users WHERE user_id = ?';
        console.log('Executing user check query:', userCheckQuery);
        
        const [userCheck] = await pool.query(userCheckQuery, [req.params.guideId])
            .catch(err => {
                console.error('Error checking user:', err);
                throw new Error('Failed to check user details');
            });

        if (!userCheck.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userCheck[0].user_type !== 'Guide') {
            return res.status(400).json({ message: 'User is not a guide' });
        }

        // Get guide_id from guides table using user_id
        const guideCheckQuery = 'SELECT guide_id FROM guides WHERE user_id = ?';
        const [guideResult] = await pool.query(guideCheckQuery, [req.params.guideId])
            .catch(err => {
                console.error('Error checking guide:', err);
                throw new Error('Failed to check guide details');
            });

        let guideId;
        if (!guideResult.length) {
            // If guide entry doesn't exist, create one
            const insertGuideQuery = 'INSERT INTO guides (user_id) VALUES (?)';
            const [insertResult] = await pool.query(insertGuideQuery, [req.params.guideId])
                .catch(err => {
                    console.error('Error creating guide entry:', err);
                    throw new Error('Failed to create guide entry');
                });
            guideId = insertResult.insertId;
        } else {
            guideId = guideResult[0].guide_id;
        }

        // First, try to add review_date column if it doesn't exist
        try {
            await pool.query(`
                ALTER TABLE guide_reviews 
                ADD COLUMN IF NOT EXISTS review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
        } catch (err) {
            console.error('Error adding review_date column:', err);
            // Continue even if this fails
        }

        // Get the reviews using the guide_id
        const reviewsQuery = `
            SELECT 
                gr.review_id,
                gr.guide_id,
                gr.user_id,
                gr.rating,
                gr.review_text,
                gr.review_date,
                u.name as reviewer_name,
                u.email as reviewer_email,
                u.nationality as reviewer_nationality
            FROM guide_reviews gr
            JOIN Users u ON gr.user_id = u.user_id
            WHERE gr.guide_id = ?
            ORDER BY gr.review_date DESC, gr.review_id DESC
        `;

        const [reviews] = await pool.query(reviewsQuery, [guideId])
            .catch(err => {
                console.error('Error executing reviews query:', err);
                throw new Error(`Failed to fetch reviews: ${err.message}`);
            });

        // Transform the data and handle null values
        const formattedReviews = reviews.map(review => ({
            ...review,
            reviewer_nationality: review.reviewer_nationality || 'Not specified',
            review_date: review.review_date ? new Date(review.review_date).toISOString() : null
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error('Error in /reviews/:guideId endpoint:', error);
        res.status(500).json({ 
            message: 'Failed to fetch reviews',
            error: error.message,
            guide_user_id: req.params.guideId
        });
    }
});

// Create a new review
router.post('/reviews/:guideId', authenticateToken, async (req, res) => {
    try {
        const { rating, review_text } = req.body;
        const tourist_id = req.user.userId || req.user.user_id;
        const guide_user_id = req.params.guideId;

        // Validate input
        if (!rating || !review_text) {
            return res.status(400).json({ message: 'Rating and review text are required' });
        }

        // Start transaction
        await pool.query('START TRANSACTION');

        // First check if the user exists and is a guide
        const [userCheck] = await pool.query(
            'SELECT user_id, user_type FROM Users WHERE user_id = ?',
            [guide_user_id]
        );

        if (!userCheck.length) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Guide not found' });
        }

        if (userCheck[0].user_type !== 'Guide') {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'User is not a guide' });
        }

        // Get guide_id from guides table using user_id
        const [guideResult] = await pool.query(
            'SELECT guide_id FROM guides WHERE user_id = ?',
            [guide_user_id]
        );

        let guide_id;
        if (!guideResult.length) {
            // If guide entry doesn't exist, create one
            const [insertResult] = await pool.query(
                'INSERT INTO guides (user_id) VALUES (?)',
                [guide_user_id]
            );
            guide_id = insertResult.insertId;
        } else {
            guide_id = guideResult[0].guide_id;
        }

        // Check if tourist has already reviewed this guide
        const [existingReview] = await pool.query(
            'SELECT review_id FROM guide_reviews WHERE guide_id = ? AND user_id = ?',
            [guide_id, tourist_id]
        );

        if (existingReview.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'You have already reviewed this guide' });
        }

        // Insert the review
        const [reviewResult] = await pool.query(
            'INSERT INTO guide_reviews (guide_id, user_id, rating, review_text, is_read) VALUES (?, ?, ?, ?, FALSE)',
            [guide_id, tourist_id, rating, review_text]
        );

        // Get tourist name for notification
        const [touristResult] = await pool.query(
            'SELECT name FROM Users WHERE user_id = ?',
            [tourist_id]
        );
        const touristName = touristResult[0]?.name || 'A tourist';

        // Create notification for admin
        const [notificationResult] = await pool.query(
            'INSERT INTO notifications (user_id, type, content, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [29, 'review', `New guide review from ${touristName}`, reviewResult.insertId]
        );

        console.log('Created review notification for admin:', notificationResult.insertId);

        // Emit socket events for real-time notification
        if (req.app.get('io')) {
            const io = req.app.get('io');
            
            console.log('Emitting new_review event to admin room');
            // Emit to admin's room
            io.to('admin').emit('new_review', {
                review_id: reviewResult.insertId,
                tourist_name: touristName,
                rating: rating
            });

            console.log('Emitting new_notification event to admin room');
            // Emit notification
            io.to('admin').emit('new_notification', {
                id: notificationResult.insertId,
                type: 'review',
                content: `New guide review from ${touristName}`,
                reference_id: reviewResult.insertId,
                created_at: new Date(),
                is_read: false
            });
        } else {
            console.log('Socket.io instance not found in app');
        }

        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Review submitted successfully',
            review_id: reviewResult.insertId
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Failed to submit review', error: error.message });
    }
});

// Get guide messages
router.get('/messages/:userId', async (req, res) => {
    try {
        const [chats] = await pool.query(
            `SELECT 
                c.tourist_id,
                u.name as tourist_name,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'message_id', m.message_id,
                        'sender_id', m.sender_id,
                        'message', m.message,
                        'created_at', m.created_at
                    )
                ) as messages
             FROM Chats c
             JOIN Users u ON c.tourist_id = u.user_id
             JOIN Messages m ON c.chat_id = m.chat_id
             WHERE c.guide_id = ?
             GROUP BY c.tourist_id, u.name
             ORDER BY MAX(m.created_at) DESC`,
            [req.params.userId]
        );
        
        res.json(chats);
    } catch (error) {
        console.error('Error fetching guide messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send message
router.post('/messages', async (req, res) => {
    try {
        const { guide_id, tourist_id, message } = req.body;

        // Check if chat exists or create new one
        let [existingChat] = await pool.query(
            'SELECT chat_id FROM Chats WHERE guide_id = ? AND tourist_id = ?',
            [guide_id, tourist_id]
        );

        let chatId;
        if (existingChat.length === 0) {
            const [newChat] = await pool.query(
                'INSERT INTO Chats (guide_id, tourist_id) VALUES (?, ?)',
                [guide_id, tourist_id]
            );
            chatId = newChat.insertId;
        } else {
            chatId = existingChat[0].chat_id;
        }

        // Insert message
        await pool.query(
            'INSERT INTO Messages (chat_id, sender_id, message) VALUES (?, ?, ?)',
            [chatId, guide_id, message]
        );

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all guides
router.get('/all-guides', async (req, res) => {
    try {
        const [guides] = await pool.query(
            `SELECT u.user_id, u.name, u.nationality, u.phone_number, u.guide_type,
                    g.profile_pic, g.years_of_experience, g.languages, g.about, g.specialization
             FROM Users u 
             LEFT JOIN guides g ON u.user_id = g.user_id 
             WHERE u.user_type = 'Guide' AND u.is_verified = 1
             ORDER BY u.name ASC`
        );

        res.json(guides);
    } catch (error) {
        console.error('Error fetching all guides:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get guide availability
router.get('/guide-availability/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching availability for user:', userId);

        // First check if user exists and is a guide
        const [userCheck] = await pool.query(
            'SELECT user_id, user_type FROM Users WHERE user_id = ?',
            [userId]
        );

        if (!userCheck.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userCheck[0].user_type !== 'Guide') {
            return res.status(403).json({ message: 'User is not a guide' });
        }

        // Get or create guide record
        let guideId;
        const [guideCheck] = await pool.query(
            'SELECT guide_id FROM guides WHERE user_id = ?',
            [userId]
        );

        if (!guideCheck.length) {
            const [newGuide] = await pool.query(
                'INSERT INTO guides (user_id) VALUES (?)',
                [userId]
            );
            guideId = newGuide.insertId;
        } else {
            guideId = guideCheck[0].guide_id;
        }

        // Get availability
        const [availability] = await pool.query(
            'SELECT date, is_available FROM guide_availability WHERE guide_id = ? ORDER BY date',
            [guideId]
        );

        console.log('Found availability records:', availability.length);
        res.json(availability);
    } catch (error) {
        console.error('Error fetching guide availability:', error);
        res.status(500).json({ message: 'Failed to fetch guide availability' });
    }
});

// Update guide availability
router.post('/guide-availability/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { date, is_available } = req.body;

        console.log('Received request:', { userId, date, is_available });

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // First check if user exists and is a guide
        console.log('Checking user:', userId);
        const [userCheck] = await pool.query(
            'SELECT user_id, user_type FROM Users WHERE user_id = ?',
            [userId]
        );

        console.log('User check result:', userCheck);

        if (!userCheck.length) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        if (userCheck[0].user_type !== 'Guide') {
            console.log('User is not a guide:', userCheck[0].user_type);
            return res.status(403).json({ message: 'User is not a guide' });
        }

        // Get or create guide record
        console.log('Checking guide record for user:', userId);
        const [guideCheck] = await pool.query(
            'SELECT guide_id FROM guides WHERE user_id = ?',
            [userId]
        );

        console.log('Guide check result:', guideCheck);

        let guideId;
        if (!guideCheck.length) {
            console.log('Creating new guide record for user:', userId);
            const [newGuide] = await pool.query(
                'INSERT INTO guides (user_id) VALUES (?)',
                [userId]
            );
            guideId = newGuide.insertId;
            console.log('Created new guide with ID:', guideId);
        } else {
            guideId = guideCheck[0].guide_id;
            console.log('Found existing guide with ID:', guideId);
        }

        // Start transaction
        await pool.query('START TRANSACTION');

        // Check if entry exists
        console.log('Checking existing availability for guide:', guideId, 'date:', date);
        const [existing] = await pool.query(
            'SELECT availability_id FROM guide_availability WHERE guide_id = ? AND date = ?',
            [guideId, date]
        );

        console.log('Existing availability check result:', existing);

        if (existing.length > 0) {
            console.log('Updating existing availability record');
            // Update existing entry
            await pool.query(
                'UPDATE guide_availability SET is_available = ? WHERE guide_id = ? AND date = ?',
                [is_available, guideId, date]
            );
        } else {
            console.log('Creating new availability record');
            // Insert new entry
            await pool.query(
                'INSERT INTO guide_availability (guide_id, date, is_available) VALUES (?, ?, ?)',
                [guideId, date, is_available]
            );
        }

        await pool.query('COMMIT');
        console.log('Availability updated successfully');
        res.json({ message: 'Availability updated successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating guide availability:', error);
        res.status(500).json({ message: 'Failed to update guide availability' });
    }
});

// Get unread reviews count
router.get('/unread-reviews-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching unread reviews count for user:', userId);
    
    // Get guide_id from guides table
    const [guideResult] = await pool.query(
      'SELECT guide_id FROM guides WHERE user_id = ?',
      [userId]
    );

    if (!guideResult.length) {
      console.log('No guide found for user:', userId);
      return res.json({ unreadCount: 0 });
    }

    const guideId = guideResult[0].guide_id;
    console.log('Found guide_id:', guideId);

    // Get count of unread reviews
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM guide_reviews WHERE guide_id = ? AND is_read = FALSE',
      [guideId]
    );

    console.log('Unread reviews count:', result[0].count);
    res.json({ unreadCount: result[0].count });
  } catch (error) {
    console.error('Error fetching unread reviews count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark reviews as read
router.post('/mark-reviews-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Marking reviews as read for user:', userId);
    
    // Get guide_id from guides table
    const [guideResult] = await pool.query(
      'SELECT guide_id FROM guides WHERE user_id = ?',
      [userId]
    );

    if (!guideResult.length) {
      console.log('No guide found for user:', userId);
      return res.json({ message: 'No guide found' });
    }

    const guideId = guideResult[0].guide_id;
    console.log('Found guide_id:', guideId);

    // Mark all reviews as read
    const [updateResult] = await pool.query(
      'UPDATE guide_reviews SET is_read = TRUE WHERE guide_id = ? AND is_read = FALSE',
      [guideId]
    );

    console.log('Updated reviews:', updateResult.affectedRows);
    res.json({ message: 'Reviews marked as read', updatedCount: updateResult.affectedRows });
  } catch (error) {
    console.error('Error marking reviews as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings for a guide
router.get('/bookings', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId || req.user.user_id;
    console.log('Fetching bookings for guide user ID:', userId);
    
    const [bookings] = await connection.query(`
      SELECT 
        b.id as booking_id,
        b.guide_user_id,
        b.tourist_user_id,
        b.booking_date,
        b.amount,
        b.transaction_id,
        b.payment_method,
        b.status,
        b.payment_status,
        b.is_read,
        b.created_at,
        b.updated_at,
        u.name as tourist_name
      FROM bookings b
      JOIN Users u ON b.tourist_user_id = u.user_id
      WHERE b.guide_user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);

    console.log('Found bookings:', bookings.length);
    // Always return an array
    res.json(Array.isArray(bookings) ? bookings : []);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    // Return empty array in case of error
    res.status(500).json([]);
  } finally {
    connection.release();
  }
});

// Get unread bookings count
router.get('/unread-bookings-count', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId || req.user.user_id;
    console.log('Fetching unread bookings count for user:', userId);
    
    const [result] = await connection.query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE guide_user_id = ? AND is_read = 0
    `, [userId]);

    console.log('Unread bookings count:', result[0].count);
    res.json({ success: true, count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread bookings count:', error);
    res.status(500).json({ success: false, message: 'Error fetching unread bookings count' });
  } finally {
    connection.release();
  }
});

// Mark bookings as read
router.post('/mark-bookings-read', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId || req.user.user_id;
    console.log('Marking bookings as read for user:', userId);
    
    const [result] = await connection.query(`
      UPDATE bookings
      SET is_read = 1
      WHERE guide_user_id = ? AND is_read = 0
    `, [userId]);

    console.log('Updated bookings:', result.affectedRows);
    res.json({ success: true, updatedCount: result.affectedRows });
  } catch (error) {
    console.error('Error marking bookings as read:', error);
    res.status(500).json({ success: false, message: 'Error marking bookings as read' });
  } finally {
    connection.release();
  }
});

// Update booking status
router.put('/bookings/:bookingId/status', authenticateToken, async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const userId = req.user.userId || req.user.user_id;
  
  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const connection = await pool.getConnection();
  try {
    // First check if the booking belongs to this guide
    const [booking] = await connection.query(`
      SELECT * FROM bookings WHERE id = ? AND guide_user_id = ?
    `, [bookingId, userId]);

    if (booking.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    // Update the booking status
    await connection.query(`
      UPDATE bookings
      SET status = ?, updated_at = NOW()
      WHERE id = ? AND guide_user_id = ?
    `, [status, bookingId, userId]);

    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Error updating booking status' });
  } finally {
    connection.release();
  }
});

export default router; 