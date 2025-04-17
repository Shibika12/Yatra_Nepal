import express from 'express';
import pool from '../lib/db.js';
import fs from 'fs';
import authenticateToken from '../middleware/authenticateToken.js';

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
  const { guideId, status } = req.body;
  
  try {
    await pool.query('START TRANSACTION');

    // Update user verification status
    await pool.query(
      'UPDATE Users SET is_verified = ? WHERE user_id = ?',
      [status === 'approved' ? 1 : 2, guideId]
    );

    // Update all pending documents for this guide
    await pool.query(
      'UPDATE GuideDocuments SET status = ? WHERE user_id = ? AND status = "pending"',
      [status, guideId]
    );

    await pool.query('COMMIT');
    
    res.json({ message: `Guide ${status} successfully` });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating guide status:', error);
    res.status(500).json({ message: 'Server error' });
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

export default router; 