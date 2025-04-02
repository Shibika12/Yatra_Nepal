CREATE TABLE IF NOT EXISTS guide_availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    guide_id INT NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE,
    UNIQUE KEY unique_guide_date (guide_id, date)
); 