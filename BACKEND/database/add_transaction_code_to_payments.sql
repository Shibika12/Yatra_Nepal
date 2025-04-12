-- Add transaction_code column to payments table
ALTER TABLE payments
ADD COLUMN transaction_code VARCHAR(255) AFTER transaction_id;

-- Update existing records to have a default value if needed
UPDATE payments 
SET transaction_code = transaction_id 
WHERE transaction_code IS NULL; 