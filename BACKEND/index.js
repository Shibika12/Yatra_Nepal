import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());


connectToDatabase()
    .then(() => {
        
        app.use('/auth', authRoutes);
        
        const PORT = 3002;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });