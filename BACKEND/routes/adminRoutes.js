const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// Get all pending guide validations
router.get('/pending-guides', async (req, res) => {
  try {
    const [guides] = await pool.query(`
      SELECT u.*, gv.years_of_experience, gv.citizenship_document, gv.guide_license 
      FROM Users u 
      LEFT JOIN GuideValidation gv ON u.user_id = gv.user_id 
      WHERE u.user_type = 'Guide' AND u.is_verified = 0
    `);
    
    res.json(guides);
  } catch (error) {
    console.error('Error fetching pending guides:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle guide approval/rejection
router.post('/guide-approval', async (req, res) => {
  const { guideId, status } = req.body;
  
  try {
    await pool.query(
      'UPDATE Users SET is_verified = ? WHERE user_id = ?',
      [status === 'approved' ? 1 : 2, guideId]
    );
    
    res.json({ message: `Guide ${status} successfully` });
  } catch (error) {
    console.error('Error updating guide status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 