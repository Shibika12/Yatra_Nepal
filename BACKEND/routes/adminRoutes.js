import express from 'express';
import pool from '../lib/db.js';
import fs from 'fs';
import authenticateToken from '../middleware/authenticateToken.js';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

// Debug middleware for admin routes
router.use((req, res, next) => {
  console.log('Admin route accessed:', req.method, req.url);
  next();
});

// Admin role check middleware
router.use(authenticateToken, (req, res, next) => {
  console.log('Checking admin access:', req.user);
  
  if (!req.user || !req.user.is_admin) {
    console.error('Access denied. User is not admin:', req.user);
    return res.status(403).json({ 
      message: 'Access denied. Admin only.',
      user: req.user ? {
        user_type: req.user.user_type,
        is_admin: req.user.is_admin
      } : null
    });
  }
  next();
});

// Get all users with their status
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        user_id,
        name,
        email,
        phone_number,
        nationality,
        user_type,
        guide_type,
        is_verified,
        created_at
      FROM Users
      ORDER BY created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all guides with their status
router.get('/guides', async (req, res) => {
  try {
    const [guides] = await pool.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.guide_type,
        u.is_verified,
        CASE 
          WHEN u.is_verified = 1 THEN 'approved'
          WHEN u.is_verified = 2 THEN 'rejected'
          ELSE 'pending'
        END as status
      FROM Users u
      WHERE u.user_type = 'Guide'
      ORDER BY u.created_at DESC
    `);
    
    res.json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending guides
router.get('/pending-guides', async (req, res) => {
  try {
    console.log('Fetching pending guides...');
    const [guides] = await pool.query(`
      SELECT DISTINCT
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.guide_type,
        u.nationality,
        u.created_at,
        u.is_verified
      FROM Users u
      INNER JOIN GuideDocuments gd ON u.user_id = gd.user_id
      WHERE u.user_type = 'Guide' 
      AND gd.status = 'pending'
      AND u.is_verified = 0
    `);
    
    // For each guide, fetch their documents
    const guidesWithDocs = await Promise.all(guides.map(async (guide) => {
      const [documents] = await pool.query(`
        SELECT 
          guide_document_id as id,
          document_type as type,
          document_path as path,
          status,
          uploaded_at
        FROM GuideDocuments
        WHERE user_id = ?
      `, [guide.user_id]);

      return {
        ...guide,
        documents
      };
    }));

    res.json(guidesWithDocs);
  } catch (error) {
    console.error('Error fetching pending guides:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle guide approval/rejection
router.post('/guide-approval', async (req, res) => {
  const { guideId, status, message } = req.body;
  
  console.log('Received guide approval request:', {
    guideId,
    status,
    messageLength: message ? message.length : 0
  });
  
  try {
    await pool.query('START TRANSACTION');

    // Get guide's email and name
    const [guideData] = await pool.query(
      'SELECT name, email FROM Users WHERE user_id = ?',
      [guideId]
    );

    if (!guideData.length) {
      console.error('Guide not found with ID:', guideId);
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Guide not found' });
    }

    const guide = guideData[0];
    console.log('Found guide data:', {
      name: guide.name,
      email: guide.email
    });

    // Update user verification status
    await pool.query(
      'UPDATE Users SET is_verified = ? WHERE user_id = ?',
      [status === 'approved' ? 1 : 2, guideId]
    );
    console.log('Updated user verification status');

    // Update all pending documents for this guide
    await pool.query(
      'UPDATE GuideDocuments SET status = ? WHERE user_id = ? AND status = "pending"',
      [status, guideId]
    );
    console.log('Updated guide documents status');

    // Send verification email
    try {
      console.log('Attempting to send verification email to:', guide.email);
      await sendVerificationEmail(guide.email, guide.name, status, message);
      console.log('Verification email sent successfully to:', guide.email);
    } catch (emailError) {
      console.error('Detailed email error:', {
        error: emailError.message,
        code: emailError.code,
        command: emailError.command,
        stack: emailError.stack
      });
      // Continue with the transaction even if email fails
    }

    await pool.query('COMMIT');
    console.log('Database transaction committed successfully');
    
    res.json({ 
      message: `Guide ${status} successfully and notification email sent`,
      guide: {
        name: guide.name,
        email: guide.email,
        status: status
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error in guide approval process:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Get guide details by ID
router.get('/pending-guides/:userId', async (req, res) => {
  try {
    const [guide] = await pool.query(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.nationality,
        u.guide_type,
        u.created_at,
        u.is_verified
      FROM Users u
      WHERE u.user_id = ? AND u.user_type = 'Guide'
    `, [req.params.userId]);

    if (!guide.length) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    // Fetch documents for this guide
    const [documents] = await pool.query(`
      SELECT 
        guide_document_id as id,
        document_type as type,
        document_path as path,
        status,
        uploaded_at
      FROM GuideDocuments
      WHERE user_id = ?
    `, [req.params.userId]);

    const guideWithDocs = {
      ...guide[0],
      documents
    };

    res.json(guideWithDocs);
  } catch (error) {
    console.error('Error fetching guide details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all guide reviews
router.get('/guide-reviews', async (req, res) => {
    try {
        const [reviews] = await pool.query(`
            SELECT 
                gr.review_id,
                gr.guide_id,
                gr.user_id as tourist_id,
                gr.rating,
                gr.review_text,
                gr.review_date,
                g.user_id as guide_user_id,
                ug.name as guide_name,
                ug.email as guide_email,
                ut.name as tourist_name,
                ut.email as tourist_email
            FROM guide_reviews gr
            JOIN guides g ON gr.guide_id = g.guide_id
            JOIN Users ug ON g.user_id = ug.user_id
            JOIN Users ut ON gr.user_id = ut.user_id
            ORDER BY gr.review_date DESC, gr.review_id DESC
        `);

        // Transform the data and handle null values
        const formattedReviews = reviews.map(review => ({
            ...review,
            review_date: review.review_date ? new Date(review.review_date).toISOString() : null
        }));

        res.json(formattedReviews);
    } catch (error) {
        console.error('Error fetching all guide reviews:', error);
        res.status(500).json({ 
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
});

// Delete a blog post and its associated images
router.delete('/blogs/:blogId', async (req, res) => {
  try {
    const blogId = req.params.blogId;

    await pool.query('START TRANSACTION');

    // Get the image paths before deleting
    const [images] = await pool.query(
      'SELECT image_path FROM blog_images WHERE blog_id = ?',
      [blogId]
    );

    // Delete the blog likes
    await pool.query('DELETE FROM blog_likes WHERE blog_id = ?', [blogId]);

    // Delete the blog images from database
    await pool.query('DELETE FROM blog_images WHERE blog_id = ?', [blogId]);

    // Delete the blog post
    await pool.query('DELETE FROM blogs WHERE blog_id = ?', [blogId]);

    await pool.query('COMMIT');

    // Delete the actual image files
    images.forEach(image => {
      const filePath = image.image_path;
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      }
    });

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog' });
  }
});

// Get tourist count
router.get('/tourists/count', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Executing tourist count query...');
    const [rows] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM Users 
      WHERE user_type = 'Tourist'
    `);
    console.log('Tourist count result:', rows[0]);
    res.json({ count: parseInt(rows[0].count) || 0 });
  } catch (error) {
    console.error('Error getting tourist count:', error);
    console.error('SQL Error:', error.sqlMessage);
    res.status(500).json({ 
      message: 'Error getting tourist count',
      error: error.sqlMessage 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get verified guides count
router.get('/guides/verified-count', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Executing verified guides count query...');
    const [rows] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM Users 
      WHERE user_type = 'Guide' 
      AND is_verified = 1
    `);
    console.log('Verified guides count result:', rows[0]);
    res.json({ count: parseInt(rows[0].count) || 0 });
  } catch (error) {
    console.error('Error getting verified guides count:', error);
    console.error('SQL Error:', error.sqlMessage);
    res.status(500).json({ 
      message: 'Error getting verified guides count',
      error: error.sqlMessage 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get reviews count
router.get('/reviews/count', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM guide_reviews');
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Error getting reviews count:', error);
    res.status(500).json({ message: 'Error getting reviews count' });
  } finally {
    connection.release();
  }
});

// Get guide distribution
router.get('/guides/distribution', authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Executing guide distribution query...');
    const [rows] = await connection.query(`
      SELECT 
        COALESCE(guide_type, 'Unspecified') as guide_type,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM Users 
          WHERE user_type = 'Guide'
        )), 1) as percentage
      FROM Users 
      WHERE user_type = 'Guide'
      GROUP BY guide_type WITH ROLLUP
    `);
    console.log('Guide distribution result:', rows);
    
    // Filter out the total row from WITH ROLLUP
    const filteredRows = rows.filter(row => row.guide_type !== null);
    
    res.json(filteredRows);
  } catch (error) {
    console.error('Error getting guide distribution:', error);
    console.error('SQL Error:', error.sqlMessage);
    res.status(500).json({ 
      message: 'Error getting guide distribution',
      error: error.sqlMessage 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get pending guides count
router.get('/pending-guides-count', async (req, res) => {
  try {
    console.log('Fetching pending guides count...');
    const [result] = await pool.query(`
      SELECT COUNT(DISTINCT u.user_id) as count
      FROM Users u
      INNER JOIN GuideDocuments gd ON u.user_id = gd.user_id
      WHERE u.user_type = 'Guide' 
      AND gd.status = 'pending'
      AND u.is_verified = 0
    `);
    
    console.log('Pending guides count:', result[0].count);
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching pending guides count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction data for graph
router.get('/transactions/graph', authenticateToken, async (req, res) => {
  let connection;
  try {
    console.log('Fetching transaction data for graph...');
    connection = await pool.getConnection();

    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM payments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC;
    `;

    const [rows] = await connection.query(query);
    console.log('Raw transaction data:', rows);

    // Fill in missing dates
    const filledData = fillMissingDates(rows);
    console.log('Filled transaction data:', filledData);

    res.json(filledData);
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction data'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Helper function to fill missing dates in transaction data
function fillMissingDates(results) {
  const filledData = [];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);

  // Create a map of existing dates
  const dateMap = new Map();
  results.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0];
    dateMap.set(dateStr, {
      date: item.date,
      total_amount: parseFloat(item.total_amount || 0),
      transaction_count: parseInt(item.transaction_count || 0)
    });
  });

  // Fill in all dates
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    filledData.push(
      dateMap.get(dateStr) || {
        date: new Date(d),
        total_amount: 0,
        transaction_count: 0
      }
    );
  }

  return filledData;
}

// Get all tourists
router.get('/tourists', async (req, res) => {
  try {
    const [tourists] = await pool.query(`
      SELECT 
        user_id,
        name,
        email,
        phone_number,
        nationality,
        created_at,
        is_verified
      FROM Users
      WHERE user_type = 'Tourist'
      ORDER BY created_at DESC
    `);
    
    res.json(tourists);
  } catch (error) {
    console.error('Error fetching tourists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get count of unread blogs
router.get('/unread-blogs-count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM blogs WHERE is_read = FALSE',
      []
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread blogs count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread blogs count',
      error: error.message 
    });
  }
});

// Get count of unread reviews
router.get('/unread-reviews-count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM guide_reviews WHERE is_read = FALSE',
      []
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread reviews count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread reviews count',
      error: error.message 
    });
  }
});

// Get count of unread payments
router.get('/unread-payments-count', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM payments WHERE is_read = FALSE',
      []
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching unread payments count:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread payments count',
      error: error.message 
    });
  }
});

// Mark blogs as read
router.put('/mark-blogs-read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE blogs SET is_read = TRUE WHERE is_read = FALSE'
    );
    res.json({ success: true, message: 'All blogs marked as read' });
  } catch (error) {
    console.error('Error marking blogs as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark blogs as read',
      error: error.message 
    });
  }
});

// Mark reviews as read
router.put('/mark-reviews-read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE guide_reviews SET is_read = TRUE WHERE is_read = FALSE'
    );
    res.json({ success: true, message: 'All reviews marked as read' });
  } catch (error) {
    console.error('Error marking reviews as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark reviews as read',
      error: error.message 
    });
  }
});

// Mark payments as read
router.put('/mark-payments-read', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE payments SET is_read = TRUE WHERE is_read = FALSE'
    );
    res.json({ success: true, message: 'All payments marked as read' });
  } catch (error) {
    console.error('Error marking payments as read:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark payments as read',
      error: error.message 
    });
  }
});

// Get all blogs (admin)
router.get('/blogs', async (req, res) => {
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