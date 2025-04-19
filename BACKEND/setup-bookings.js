import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupBookings() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Yatra_Nepal'
    });

    console.log('Connected to database successfully');

    const sqlFilePath = path.join(__dirname, 'database', 'bookings.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    const sqlCommands = sqlContent
      .split(';')
      .map(command => command.trim())
      .filter(command => command.length > 0);

    for (const command of sqlCommands) {
      console.log('Executing SQL command:', command);
      await connection.query(command);
      console.log('SQL command executed successfully');
    }

    console.log('Bookings table setup completed successfully');
  } catch (error) {
    console.error('Error setting up bookings table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupBookings(); 