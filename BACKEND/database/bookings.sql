CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guide_id INT NOT NULL,
  tourist_user_id INT NOT NULL,
  booking_date DATETIME NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  is_read BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE,
  FOREIGN KEY (tourist_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 