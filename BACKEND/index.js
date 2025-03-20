import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

connectToDatabase()
    .then(() => {
        app.use('/auth', authRoutes);
        app.use('/admin', adminRoutes);
        
        const PORT = 3002;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });