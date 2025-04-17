import express from 'express';
import bcrypt from 'bcrypt';  // You'll need to install this: npm install bcrypt
import pool from '../lib/db.js';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/guide-documents';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
}).fields([
    { name: 'citizenshipDocument', maxCount: 1 },
    { name: 'guideLicense', maxCount: 1 }
]);

router.post('/signup', async (req, res) => {
    try {
        console.log('Received signup data:', req.body);

        const { 
            name, 
            email, 
            password, 
            phone_number, 
            nationality, 
            user_type, 
            guide_type
        } = req.body;

        // Validate required fields
        if (!name || !email || !password || !phone_number || !user_type) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { name, email, phone_number, user_type }
            });
        }

        // Validate guide_type for guides
        if (user_type === 'Guide' && !guide_type) {
            return res.status(400).json({ 
                message: 'Guide type is required for guide registration' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Set is_verified based on user type
        const is_verified = user_type === 'Tourist' ? 1 : 0;

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Check if email already exists
            const [existingUsers] = await pool.query(
                'SELECT email FROM Users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                await pool.query('ROLLBACK');
                return res.status(409).json({ 
                    message: 'This email is already registered' 
                });
            }

            // Insert user and get the inserted ID
            const [userResult] = await pool.query(
                `INSERT INTO Users (
                    name, 
                    email, 
                    password, 
                    phone_number, 
                    nationality, 
                    user_type, 
                    guide_type, 
                    is_admin, 
                    is_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    email,
                    hashedPassword,
                    phone_number,
                    nationality || 'Nepali', // Default to 'Nepali' if not provided
                    user_type,
                    guide_type || null, // Ensure null for tourists
                    0, // is_admin
                    is_verified
                ]
            );

            const userId = userResult.insertId;

            // If user is a guide, create entry in guides table
            if (user_type === 'Guide') {
                await pool.query(
                    `INSERT INTO guides (
                        user_id,
                        years_of_experience,
                        languages
                    ) VALUES (?, ?, ?)`,
                    [userId, 0, 'English'] // Default values, to be updated later
                );
            }
            // For tourists, we don't need to do anything extra since all info is in Users table

            // Commit transaction
            await pool.query('COMMIT');

            console.log('Registration successful:', {
                userId,
                user_type,
                guide_type: guide_type || null,
                nationality: nationality || 'Nepali'
            });

            res.status(200).json({ 
                message: "User registered successfully",
                userId: userId 
            });

        } catch (error) {
            // Rollback on error
            await pool.query('ROLLBACK');
            console.error('Database error during registration:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error in signup:', error);
        
        // Check for duplicate email (in case the earlier check missed it)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                message: 'This email is already registered' 
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during registration', 
            error: error.message 
        });
    }
});

// Update the login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const [users] = await pool.query(
            "SELECT u.*, gd.status as guide_status FROM Users u LEFT JOIN GuideDocuments gd ON u.user_id = gd.user_id WHERE u.email = ? ORDER BY gd.uploaded_at DESC LIMIT 1",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // If user is a guide, check their document status
        if (user.user_type === 'Guide') {
            if (user.guide_status === 'rejected') {
                return res.status(403).json({ 
                    success: false,
                    message: "Your guide application has been rejected. Please contact support for more information."
                });
            }
            if (user.guide_status === 'pending') {
                return res.status(403).json({ 
                    success: false,
                    message: "Your account is pending approval. Please wait for admin verification."
                });
            }
        }

        // Clear any existing tokens from localStorage
        res.clearCookie('token');

        // Check if user is admin (case-insensitive)
        const isAdmin = user.user_type.toLowerCase() === 'admin';

        // Generate token with all necessary user information
        const token = jwt.sign(
            { 
                userId: user.user_id,
                user_id: user.user_id, // Include both for compatibility
                user_type: user.user_type,
                is_admin: isAdmin
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Remove sensitive information from user object
        delete user.password;
        delete user.guide_status;

        // Send response with consistent role casing
        res.json({
            token,
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.user_type,
            is_admin: isAdmin,
            user: {
                ...user,
                is_admin: isAdmin
            }
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/guide-documents', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: err.message });
        }

        console.log('Received request body:', req.body); // Debug log
        console.log('Received files:', req.files); // Debug log

        try {
            const userId = req.body.userId;
            
            if (!userId) {
                return res.status(400).json({ 
                    message: 'User ID is required',
                    receivedData: req.body 
                });
            }

            if (!req.files || !req.files.citizenshipDocument || !req.files.guideLicense) {
                return res.status(400).json({ message: 'Missing required files' });
            }

            // Verify if user exists
            const [userExists] = await pool.query(
                'SELECT user_id FROM Users WHERE user_id = ?',
                [userId]
            );

            if (!userExists.length) {
                return res.status(404).json({ 
                    message: 'User not found',
                    userId: userId 
                });
            }

            const citizenshipPath = req.files.citizenshipDocument[0].path;
            const licensePath = req.files.guideLicense[0].path;

            // Begin transaction
            await pool.query('START TRANSACTION');

            try {
                // Insert citizenship document
                await pool.query(
                    `INSERT INTO GuideDocuments 
                    (user_id, document_type, document_path, status) 
                    VALUES (?, ?, ?, ?)`,
                    [userId, 'citizenship', citizenshipPath, 'pending']
                );

                // Insert license document
                await pool.query(
                    `INSERT INTO GuideDocuments 
                    (user_id, document_type, document_path, status) 
                    VALUES (?, ?, ?, ?)`,
                    [userId, 'license', licensePath, 'pending']
                );

                // Commit transaction
                await pool.query('COMMIT');

                res.status(200).json({
                    message: 'Documents uploaded successfully',
                    userId: userId
                });

            } catch (error) {
                await pool.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({
                message: 'Error saving document information',
                error: error.message,
                userId: req.body.userId
            });
        }
    });
});

// Get guide documents
router.get('/guide-documents/:userId', async (req, res) => {
    try {
        const [documents] = await pool.query(
            `SELECT * FROM GuideDocuments WHERE user_id = ?`,
            [req.params.userId]
        );
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents' });
    }
});

// Add route to get pending guide verifications
router.get('/admin/pending-verifications', async (req, res) => {
    try {
        const [pendingDocs] = await pool.query(`
            SELECT 
                gd.*, 
                u.name as guide_name,
                u.email as guide_email,
                u.phone_number,
                u.guide_type
            FROM GuideDocuments gd
            JOIN Users u ON gd.user_id = u.id
            WHERE gd.status = 'pending'
        `);
        
        res.status(200).json(pendingDocs);
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update route to update verification status
router.put('/admin/verify-guide/:docId', async (req, res) => {
    try {
        const { docId } = req.params;
        const { status, userId, message } = req.body;

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Update document status
            await pool.query(
                "UPDATE GuideDocuments SET status = ? WHERE id = ?",
                [status, docId]
            );

            // Get guide's email and name
            const [guideData] = await pool.query(
                "SELECT name, email FROM Users WHERE user_id = ?",
                [userId]
            );

            if (!guideData.length) {
                throw new Error('Guide not found');
            }

            const guide = guideData[0];

            // Update user verification status if approved
            if (status === 'approved') {
                await pool.query(
                    "UPDATE Users SET is_verified = 1 WHERE user_id = ?",
                    [userId]
                );
            }

            // Send verification email
            await sendVerificationEmail(guide.email, guide.name, status, message);

            // Commit transaction
            await pool.query('COMMIT');

            res.status(200).json({ 
                message: `Guide ${status} and notification email sent`,
                guide: {
                    name: guide.name,
                    email: guide.email,
                    status: status
                }
            });

        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error updating verification status:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

export default router;