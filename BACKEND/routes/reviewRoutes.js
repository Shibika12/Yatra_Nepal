// In your review creation route
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Your existing review creation code...
    
    // Emit socket event for new review
    req.app.get('io').emit('new_review_added');
    
    res.status(201).json({ success: true, message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
}); 