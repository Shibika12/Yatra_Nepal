import express from 'express';
import pool from '../lib/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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
            return res.status(400).json({ message: err.message });
        }

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
            await pool.query('START TRANSACTION');

            // Update user table with basic info
            if (name || phone_number) {
                const updateUserQuery = 'UPDATE Users SET ? WHERE user_id = ?';
                const updateUserData = {};
                if (name) updateUserData.name = name;
                if (phone_number) updateUserData.phone_number = phone_number;
                await pool.query(updateUserQuery, [updateUserData, userId]);
            }

            // Check if guide exists
            const [existingGuide] = await pool.query(
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
                    await pool.query('UPDATE guides SET ? WHERE user_id = ?', [guideData, userId]);
                }
            } else {
                // Create new guide entry
                await pool.query(
                    'INSERT INTO guides SET ?',
                    { ...guideData, user_id: userId }
                );
            }

            await pool.query('COMMIT');

            // Fetch and return updated profile
            const [updatedProfile] = await pool.query(
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
            await pool.query('ROLLBACK');
            console.error('Error updating guide profile:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Get guide reviews
router.get('/reviews/:guideId', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT 
                r.review_id,
                r.guide_id,
                r.user_id,
                r.rating,
                r.review_text,
                r.review_date,
                u.name as reviewer_name,
                u.email as reviewer_email,
                u.nationality as reviewer_nationality
             FROM guide_reviews r
             JOIN Users u ON r.user_id = u.user_id
             JOIN guides g ON r.guide_id = g.guide_id
             WHERE g.user_id = ? AND u.user_type = 'Tourist'
             ORDER BY r.review_date DESC`,
            [req.params.guideId]
        );

        // Transform the data to format dates and handle null values
        const formattedReviews = reviews.map(review => ({
            ...review,
            review_date: new Date(review.review_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            reviewer_nationality: review.reviewer_nationality || 'Not specified'
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error('Error fetching guide reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new review
router.post('/reviews', async (req, res) => {
    try {
        const { user_id, guide_user_id, rating, review_text } = req.body;
        console.log('Received review data:', { user_id, guide_user_id, rating, review_text });

        if (!user_id || !guide_user_id || !rating || !review_text) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { user_id, guide_user_id, rating, review_text }
            });
        }

        // Verify that the reviewer is a tourist
        const [userCheck] = await pool.query(
            'SELECT user_type FROM Users WHERE user_id = ?',
            [user_id]
        );

        console.log('User check result:', userCheck);

        if (!userCheck.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userCheck[0].user_type !== 'Tourist') {
            return res.status(403).json({ message: 'Only tourists can submit reviews' });
        }

        // Get guide_id from guides table using guide's user_id
        const [guideCheck] = await pool.query(
            'SELECT guide_id FROM guides WHERE user_id = ?',
            [guide_user_id]
        );

        console.log('Guide check result:', guideCheck);

        if (!guideCheck.length) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        // Add the review
        const [result] = await pool.query(
            'INSERT INTO guide_reviews (guide_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)',
            [guideCheck[0].guide_id, user_id, rating, review_text]
        );

        console.log('Review inserted:', result);

        res.status(201).json({
            message: 'Review added successfully',
            review_id: result.insertId
        });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

export default router; 