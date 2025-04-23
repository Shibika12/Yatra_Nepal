-- Add is_read column to blogs table
ALTER TABLE blogs
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Add is_read column to guide_reviews table
ALTER TABLE guide_reviews
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Add is_read column to payments table
ALTER TABLE payments
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Update existing records to have is_read = FALSE
UPDATE blogs SET is_read = FALSE WHERE is_read IS NULL;
UPDATE guide_reviews SET is_read = FALSE WHERE is_read IS NULL;
UPDATE payments SET is_read = FALSE WHERE is_read IS NULL; 