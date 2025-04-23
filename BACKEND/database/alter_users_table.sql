-- Modify existing columns
ALTER TABLE Users
MODIFY COLUMN email varchar(255) NOT NULL,
MODIFY COLUMN password varchar(255) NOT NULL,
MODIFY COLUMN user_type enum('admin','guide','tourist') NOT NULL,
MODIFY COLUMN first_name varchar(100),
MODIFY COLUMN last_name varchar(100),
MODIFY COLUMN created_at timestamp NOT NULL DEFAULT current_timestamp(),
MODIFY COLUMN updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
MODIFY COLUMN profile_picture varchar(255),
MODIFY COLUMN bio text,
MODIFY COLUMN address text,
MODIFY COLUMN date_of_birth date,
MODIFY COLUMN gender enum('Male','Female','Other'),
MODIFY COLUMN is_active tinyint(1) DEFAULT 1,
MODIFY COLUMN last_login timestamp NULL,
MODIFY COLUMN reset_password_token varchar(255),
MODIFY COLUMN reset_password_expires timestamp NULL,
MODIFY COLUMN guide_type varchar(50),
MODIFY COLUMN is_admin tinyint(1) DEFAULT 0,
MODIFY COLUMN is_verified tinyint(1) DEFAULT 0;

-- Add phone_number and nationality columns
ALTER TABLE Users
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NOT NULL,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) NOT NULL DEFAULT 'Nepali';

-- Add unique constraint to email if not exists
ALTER TABLE Users
ADD UNIQUE INDEX IF NOT EXISTS idx_users_email (email);

-- Add other useful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_user_type ON Users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON Users(is_verified);

-- Add new name column
ALTER TABLE Users
ADD COLUMN name VARCHAR(255) NULL;

-- Update name column with concatenated first_name and last_name
UPDATE Users 
SET name = CONCAT(IFNULL(first_name, ''), ' ', IFNULL(last_name, ''));

-- Drop first_name and last_name columns
ALTER TABLE Users
DROP COLUMN first_name,
DROP COLUMN last_name; 