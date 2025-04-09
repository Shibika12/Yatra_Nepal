-- Add is_read column to notifications table
ALTER TABLE notifications
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Set existing notifications as read
UPDATE notifications SET is_read = TRUE; 