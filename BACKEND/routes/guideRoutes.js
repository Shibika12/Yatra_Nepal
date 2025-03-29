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
            `SELECT u.*, gp.* 
             FROM Users u 
             LEFT JOIN GuideProfiles gp ON u.user_id = gp.user_id 
             WHERE u.user_id = ? AND u.user_type = 'Guide'`,
            [req.params.userId]
        );

        if (!user.length) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        // Remove sensitive information
        delete user[0].password;

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

            // Update user table
            await pool.query(
                'UPDATE Users SET name = ?, phone_number = ? WHERE user_id = ?',
                [name, phone_number, userId]
            );

            // Check if guide profile exists
            const [existingProfile] = await pool.query(
                'SELECT * FROM GuideProfiles WHERE user_id = ?',
                [userId]
            );

            const profileData = {
                years_of_experience: years_of_experience || null,
                languages: languages || null,
                about: about || null,
                specialization: specialization || null,
                profile_pic: req.file ? req.file.path : undefined
            };

            if (existingProfile.length > 0) {
                // Update existing profile
                const updateQuery = 'UPDATE GuideProfiles SET ? WHERE user_id = ?';
                if (!req.file) {
                    delete profileData.profile_pic; // Don't update profile_pic if no new file
                }
                await pool.query(updateQuery, [profileData, userId]);
            } else {
                // Create new profile
                await pool.query(
                    'INSERT INTO GuideProfiles SET ?',
                    { ...profileData, user_id: userId }
                );
            }

            await pool.query('COMMIT');

            // Fetch and return updated profile
            const [updatedProfile] = await pool.query(
                `SELECT u.*, gp.* 
                 FROM Users u 
                 LEFT JOIN GuideProfiles gp ON u.user_id = gp.user_id 
                 WHERE u.user_id = ?`,
                [userId]
            );

            delete updatedProfile[0].password;
            res.json(updatedProfile[0]);

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error updating guide profile:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
});

// Get guide reviews
router.get('/reviews/:userId', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT r.*, u.name as tourist_name
             FROM Reviews r
             JOIN Users u ON r.tourist_id = u.user_id
             WHERE r.guide_id = ?
             ORDER BY r.created_at DESC`,
            [req.params.userId]
        );
        
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching guide reviews:', error);
        res.status(500).json({ message: 'Server error' });
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

export default router; 