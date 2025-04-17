-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    transaction_code VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('esewa', 'khalti', 'cash') NOT NULL,
    status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add index for faster queries
CREATE INDEX idx_transaction_id ON payments(transaction_id);
CREATE INDEX idx_user_id ON payments(user_id);
CREATE INDEX idx_created_at ON payments(created_at); 