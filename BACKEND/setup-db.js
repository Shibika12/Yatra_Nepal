const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // This allows running multiple SQL statements
});

// Read the schema file
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Execute the schema
connection.query(schema, (err, results) => {
    if (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
    
    console.log('Database setup completed successfully!');
    connection.end();
}); 