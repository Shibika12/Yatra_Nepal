import express from 'express';
import pool from '../lib/db.js';

const router = express.Router();

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
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.guide_type,
        u.is_verified,
        gd.guide_document_id,
        gd.document_type,
        gd.document_path,
        gd.status,
        gd.uploaded_at
      FROM Users u
      LEFT JOIN GuideDocuments gd ON u.user_id = gd.user_id
      WHERE u.user_type = 'Guide' 
      AND gd.status = 'pending'
      GROUP BY u.user_id
    `);
    
    // Group documents by guide
    const guidesWithDocs = guides.reduce((acc, curr) => {
      if (!acc[curr.user_id]) {
        acc[curr.user_id] = {
          user_id: curr.user_id,
          name: curr.name,
          email: curr.email,
          phone_number: curr.phone_number,
          guide_type: curr.guide_type,
          is_verified: curr.is_verified,
          documents: []
        };
      }
      
      if (curr.guide_document_id) {
        acc[curr.user_id].documents.push({
          id: curr.guide_document_id,
          type: curr.document_type,
          path: curr.document_path,
          status: curr.status,
          uploaded_at: curr.uploaded_at
        });
      }
      
      return acc;
    }, {});

    const formattedGuides = Object.values(guidesWithDocs);
    res.json(formattedGuides);
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
        u.guide_type,
        u.is_verified,
        gd.guide_document_id,
        gd.document_type,
        gd.document_path,
        gd.status,
        gd.uploaded_at
      FROM Users u
      LEFT JOIN GuideDocuments gd ON u.user_id = gd.user_id
      WHERE u.user_id = ? AND u.user_type = 'Guide'
    `, [req.params.userId]);

    if (!guide.length) {
      return res.status(404).json({ message: 'Guide not found' });
    }

    const guideWithDocs = {
      user_id: guide[0].user_id,
      name: guide[0].name,
      email: guide[0].email,
      phone_number: guide[0].phone_number,
      guide_type: guide[0].guide_type,
      is_verified: guide[0].is_verified,
      documents: guide.map(doc => ({
        id: doc.guide_document_id,
        type: doc.document_type,
        path: doc.document_path,
        status: doc.status,
        uploaded_at: doc.uploaded_at
      })).filter(doc => doc.id)
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

export default router; 