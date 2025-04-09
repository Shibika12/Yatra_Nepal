-- Add is_read column to reviews table
ALTER TABLE reviews
ADD COLUMN is_read BOOLEAN DEFAULT 0;

-- Set existing reviews as read
UPDATE reviews SET is_read = 1;

-- Add is_read column to guide_reviews table
ALTER TABLE guide_reviews
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Update existing reviews to be marked as read
UPDATE guide_reviews SET is_read = TRUE; 