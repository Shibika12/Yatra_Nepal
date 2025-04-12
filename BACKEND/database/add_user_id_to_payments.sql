-- Add user_id column to payments table
ALTER TABLE payments
ADD COLUMN user_id INT,
ADD FOREIGN KEY (user_id) REFERENCES Users(user_id);

-- Update existing records to have a default value if needed
-- UPDATE payments SET user_id = (SELECT user_id FROM Users LIMIT 1) WHERE user_id IS NULL; 