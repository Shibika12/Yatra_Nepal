import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  database: 'yatra_nepal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool }; 