import express from 'express';
import pool from '../lib/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const router = express.Router();


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = { 
            user_id: decoded.userId || decoded.user_id,
            user_type: decoded.user_type
        };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/blogs';

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


router.get('/', authenticateToken, async (req, res) => {
    try {
        const [blogs] = await pool.query(`
            SELECT b.*, u.name as author_name, 
                   GROUP_CONCAT(bi.image_path) as images
            FROM blogs b
            LEFT JOIN Users u ON b.user_id = u.user_id
            LEFT JOIN blog_images bi ON b.blog_id = bi.blog_id
            GROUP BY b.blog_id
            ORDER BY b.created_at DESC
        `);

        // Process the images string into an array
        const processedBlogs = blogs.map(blog => ({
            ...blog,
            images: blog.images ? blog.images.split(',') : []
        }));

        res.json(processedBlogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new blog post
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.user.user_id;

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
        try {
            const [adminNotificationResult] = await pool.query(
                'INSERT INTO notifications (user_id, type, content, reference_id, is_read) VALUES (?, ?, ?, ?, ?)',
                [29, 'blog', `New blog post from ${userName}`, blog_id, false]
            );

            // Emit notification to admin if socket exists
            if (req.app.get('io')) {
                const io = req.app.get('io');
                io.to('admin').emit('new_notification', {
                    id: adminNotificationResult.insertId,
                    user_id: 29,
                    type: 'blog',
                    content: `New blog post from ${userName}`,
                    reference_id: blog_id,
                    created_at: new Date(),
                    is_read: false
                });
            }
        } catch (error) {
            // Continue even if admin notification fails
        }

        // Get all tourist users to notify them about the new blog
        const [tourists] = await pool.query(
            'SELECT user_id FROM Users WHERE user_type = ? AND user_id != ?',
            ['Tourist', user_id]
        );

        // Create notifications for all tourists
        for (const tourist of tourists) {
            try {
                const [notificationResult] = await pool.query(
                    'INSERT INTO notifications (user_id, type, content, reference_id, is_read) VALUES (?, ?, ?, ?, ?)',
                    [tourist.user_id, 'blog', `New blog post from ${userName}`, blog_id, false]
                );

                // Emit notification to this specific tourist
                if (req.app.get('io')) {
                    const io = req.app.get('io');
                    io.to(tourist.user_id.toString()).emit('new_notification', {
                        id: notificationResult.insertId,
                        user_id: tourist.user_id,
                        type: 'blog',
                        content: `New blog post from ${userName}`,
                        reference_id: blog_id,
                        created_at: new Date(),
                        is_read: false
                    });
                }
            } catch (error) {
                // Continue even if individual tourist notification fails
            }
        }

        // Emit socket event for new blog
        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Blog post created successfully',
            blog_id: blog_id
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ 
            message: 'Failed to create blog post', 
            error: error.message
        });
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

        // Start transaction
        await pool.query('START TRANSACTION');

        // Check if blog exists and get author info with proper joins
        const [blogInfo] = await pool.query(
            `SELECT 
                b.blog_id, 
                b.user_id as author_id, 
                u1.name as author_name, 
                u2.name as liker_name 
            FROM blogs b 
            INNER JOIN Users u1 ON b.user_id = u1.user_id 
            INNER JOIN Users u2 ON u2.user_id = ? 
            WHERE b.blog_id = ?`,
            [user_id, blogId]
        );

        if (!blogInfo.length) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Blog not found' });
        }

        const { author_id, author_name, liker_name } = blogInfo[0];
        console.log('Blog info:', { author_id, author_name, liker_name, user_id });

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
            await pool.query('COMMIT');
            res.json({ message: 'Blog unliked successfully' });
        } else {
            // Like
            const [likeResult] = await pool.query(
                'INSERT INTO blog_likes (blog_id, user_id) VALUES (?, ?)',
                [blogId, user_id]
            );

            // Don't notify if user is liking their own blog
            if (author_id !== user_id) {
                try {
                    console.log('Creating notification for author:', author_id);
                    // Create notification for blog author
                    const [notificationResult] = await pool.query(
                        'INSERT INTO notifications (user_id, type, content, reference_id, is_read, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                        [author_id, 'blog_like', `${liker_name} liked your blog post`, blogId, false]
                    );

                    console.log('Notification created:', notificationResult.insertId);

                    // Send real-time notification
                    const io = req.app.get('io');
                    if (io) {
                        // Emit to author's personal room
                        const authorRoom = author_id.toString();
                        console.log('Emitting notification to author room:', authorRoom);
                        
                        const notification = {
                            id: notificationResult.insertId,
                            user_id: author_id,
                            type: 'blog_like',
                            content: `${liker_name} liked your blog post`,
                            reference_id: blogId,
                            created_at: new Date(),
                            is_read: false
                        };
                        
                        console.log('Emitting notification:', notification);
                        io.to(authorRoom).emit('new_notification', notification);
                    } else {
                        console.error('Socket.io instance not found in app');
                    }
                } catch (notifError) {
                    console.error('Error creating notification:', notifError);
                    // Continue with the like even if notification fails
                }
            }

            await pool.query('COMMIT');
            res.json({ 
                message: 'Blog liked successfully',
                notification_sent: author_id !== user_id
            });
        }

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error toggling blog like:', error);
        res.status(500).json({ 
            message: 'Failed to toggle blog like',
            error: error.message 
        });
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