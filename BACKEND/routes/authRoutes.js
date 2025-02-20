import express from 'express';
import pool from '../lib/db.js';
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone_number, nationality, user_type } = req.body;
        
        console.log('Received signup data:', {
            name, email, password, phone_number, nationality, user_type
        });

        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if(rows.length > 0) {
            return res.status(400).json({message: "User already exists"});
        }

        const [result] = await pool.query(
            "INSERT INTO users (name, email, password, phone_number, nationality, user_type) VALUES (?, ?, ?, ?, ?, ?)", 
            [name, email, password, phone_number, nationality, user_type]
        );

        if(result.affectedRows === 0) {
            return res.status(400).json({message: "User not created"});
        }

        return res.status(200).json({message: "User created successfully"});
        
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
});

export default router;