CREATE TABLE IF NOT EXISTS guide_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    guide_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide_id) REFERENCES guides(guide_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
); 