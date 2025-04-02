import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import touristRoutes from './routes/touristRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

connectToDatabase()
    .then(() => {
        console.log('Connected to database successfully');
        
        app.use('/auth', authRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/guides', guideRoutes);
        app.use('/api/blogs', blogRoutes);
        app.use('/api/tourists', touristRoutes);
        console.log('Routes registered successfully');
        
        const PORT = 3002;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });