-- First add the guide_id column
ALTER TABLE payments
ADD COLUMN guide_id INT NOT NULL AFTER user_id;

-- Add the foreign key constraint
ALTER TABLE payments
ADD CONSTRAINT fk_payments_guide
FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE; 