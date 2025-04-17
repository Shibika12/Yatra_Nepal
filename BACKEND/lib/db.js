import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Log database configuration (without password)
console.log('Database Configuration:', {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    database: process.env.DB_DATABASE || 'Yatra_Nepal',
    port: process.env.DB_PORT || 3306
});

export const pool = mysql.createPool({
    host: '127.0.0.1', // Use IP instead of localhost
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'Yatra_Nepal',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    authPlugins: {
        mysql_native_password: () => () => Buffer.from('', 'hex')
    }
});

// Test the connection with better error handling
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database');
        connection.release();
    })
    .catch(err => {
        console.error('Detailed database connection error:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE
        });
    });

export const connectToDatabase = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established successfully');
        connection.release();
        return pool;
    } catch (error) {
        console.error("Detailed database connection error:", {
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE
        });
        throw error;
    }
};

// We can keep the default export as well
export default pool;
