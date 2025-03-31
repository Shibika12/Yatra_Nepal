CREATE TABLE IF NOT EXISTS guides (
    guide_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    years_of_experience INT,
    languages VARCHAR(255),
    about TEXT,
    specialization TEXT,
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
); 