const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function setupNotifications() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'yatranepal'
    });

    try {
        // Read and execute the SQL file
        const sqlFile = await fs.readFile(
            path.join(__dirname, 'database', 'add_is_read_to_notifications.sql'),
            'utf8'
        );

        const statements = sqlFile.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
                console.log('Executed:', statement.trim());
            }
        }

        console.log('Successfully added is_read column to notifications table');
    } catch (error) {
        console.error('Error setting up notifications:', error);
    } finally {
        await connection.end();
    }
}

setupNotifications(); 