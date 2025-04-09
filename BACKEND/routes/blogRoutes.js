import express from 'express';
import pool from '../lib/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    console.log('Authenticating request:', req.method, req.url);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Auth header:', authHeader);
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token verified, user:', user);
        req.user = { user_id: user.userId };
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/blogs';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Create a new blog post
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.user.user_id; // Assuming user info is added by auth middleware

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        await pool.query('START TRANSACTION');

        // Insert blog post
        const [blogResult] = await pool.query(
            'INSERT INTO blogs (user_id, content) VALUES (?, ?)',
            [user_id, content]
        );

        const blog_id = blogResult.insertId;

        // Handle image uploads if any
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [
                blog_id,
                `/uploads/blogs/${file.filename}`
            ]);

            await pool.query(
                'INSERT INTO blog_images (blog_id, image_path) VALUES ?',
                [imageValues]
            );
        }

        // Get user name for notification
        const [userResult] = await pool.query(
            'SELECT name FROM Users WHERE user_id = ?',
            [user_id]
        );
        const userName = userResult[0]?.name || 'Unknown User';

        // Create notification for admin
        const [notificationResult] = await pool.query(
            'INSERT INTO notifications (user_id, type, content, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())',
            [29, 'blog', `New blog post from ${userName}`, blog_id] // Admin user_id is 29
        );

        console.log('Created notification for admin:', notificationResult.insertId);

        // Emit socket events for real-time notification
        if (req.app.get('io')) {
            const io = req.app.get('io');
            
            console.log('Emitting new_blog event to admin room');
            // Emit to admin's room
            io.to('admin').emit('new_blog', {
                blog_id: blog_id,
                author_name: userName,
                content: content.substring(0, 100) + '...' // First 100 characters
            });

            console.log('Emitting new_notification event to admin room');
            // Emit notification
            io.to('admin').emit('new_notification', {
                id: notificationResult.insertId,
                type: 'blog',
                content: `New blog post from ${userName}`,
                reference_id: blog_id,
                created_at: new Date(),
                is_read: false
            });
        } else {
            console.log('Socket.io instance not found in app');
        }

        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Blog post created successfully',
            blog_id: blog_id
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Failed to create blog post' });
    }
});

// Get all blog posts with images and likes
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [blogs] = await pool.query(`
            SELECT 
                b.blog_id,
                b.content,
                b.created_at,
                b.updated_at,
                u.user_id,
                u.name as author_name,
                COUNT(DISTINCT bl.like_id) as likes_count,
                GROUP_CONCAT(DISTINCT bi.image_path) as images,
                EXISTS(
                    SELECT 1 FROM blog_likes 
                    WHERE blog_id = b.blog_id 
                    AND user_id = ?
                ) as is_liked
            FROM blogs b
            JOIN Users u ON b.user_id = u.user_id
            LEFT JOIN blog_images bi ON b.blog_id = bi.blog_id
            LEFT JOIN blog_likes bl ON b.blog_id = bl.blog_id
            GROUP BY b.blog_id
            ORDER BY b.created_at DESC
        `, [req.user?.user_id || 0]);

        // Format the response
        const formattedBlogs = blogs.map(blog => ({
            ...blog,
            images: blog.images ? blog.images.split(',') : [],
            is_liked: Boolean(blog.is_liked)
        }));

        res.json(formattedBlogs);

    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Failed to fetch blogs' });
    }
});

// Toggle like on a blog post
router.post('/:blogId/like', authenticateToken, async (req, res) => {
    try {
        const { blogId } = req.params;
        const user_id = req.user.user_id;

        // Check if blog exists
        const [blogExists] = await pool.query(
            'SELECT blog_id FROM blogs WHERE blog_id = ?',
            [blogId]
        );

        if (!blogExists.length) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if already liked
        const [existingLike] = await pool.query(
            'SELECT like_id FROM blog_likes WHERE blog_id = ? AND user_id = ?',
            [blogId, user_id]
        );

        if (existingLike.length > 0) {
            // Unlike
            await pool.query(
                'DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?',
                [blogId, user_id]
            );
            res.json({ message: 'Blog unliked successfully' });
        } else {
            // Like
            await pool.query(
                'INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)',
                [blogId, user_id]
            );
            res.json({ message: 'Blog liked successfully' });
        }

    } catch (error) {
        console.error('Error toggling blog like:', error);
        res.status(500).json({ message: 'Failed to toggle blog like' });
    }
});

// Delete a blog post
router.delete('/:blogId', authenticateToken, async (req, res) => {
    try {
        const { blogId } = req.params;
        const user_id = req.user.user_id;

        // Check if blog exists and belongs to user
        const [blog] = await pool.query(
            'SELECT blog_id FROM blogs WHERE blog_id = ? AND user_id = ?',
            [blogId, user_id]
        );

        if (!blog.length) {
            return res.status(404).json({ 
                message: 'Blog not found or you do not have permission to delete it' 
            });
        }

        // Get image paths before deleting
        const [images] = await pool.query(
            'SELECT image_path FROM blog_images WHERE blog_id = ?',
            [blogId]
        );

        await pool.query('START TRANSACTION');

        // Delete blog (will cascade to likes and images in DB)
        await pool.query('DELETE FROM blogs WHERE blog_id = ?', [blogId]);

        await pool.query('COMMIT');

        // Delete image files from filesystem
        images.forEach(image => {
            const filePath = path.join(process.cwd(), image.image_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        res.json({ message: 'Blog deleted successfully' });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Failed to delete blog' });
    }
});

// Get all blog posts (for admin)
router.get('/all', async (req, res) => {
    try {
        const [blogs] = await pool.query(`
            SELECT 
                b.blog_id,
                b.content,
                b.created_at,
                b.updated_at,
                u.user_id,
                u.name as author_name,
                COUNT(DISTINCT bl.like_id) as likes_count,
                GROUP_CONCAT(DISTINCT bi.image_path) as images
            FROM blogs b
            JOIN Users u ON b.user_id = u.user_id
            LEFT JOIN blog_images bi ON b.blog_id = bi.blog_id
            LEFT JOIN blog_likes bl ON b.blog_id = bl.blog_id
            GROUP BY b.blog_id
            ORDER BY b.created_at DESC
        `);

        // Format the response
        const formattedBlogs = blogs.map(blog => ({
            ...blog,
            images: blog.images ? blog.images.split(',') : []
        }));

        res.json(formattedBlogs);

    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Failed to fetch blogs' });
    }
});

export default router; 