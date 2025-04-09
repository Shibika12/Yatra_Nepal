import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupReviewNotifications() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database successfully');

    const sqlFilePath = path.join(__dirname, 'database', 'add_is_read_to_reviews.sql');
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

    console.log('Review notification setup completed successfully');
  } catch (error) {
    console.error('Error setting up review notifications:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupReviewNotifications(); 