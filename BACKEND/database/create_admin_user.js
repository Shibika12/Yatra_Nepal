import bcrypt from 'bcrypt';
import pool from '../lib/db.js';

const createAdminUser = async () => {
    try {
        // Admin user details
        const adminUser = {
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin1234',
            phone_number: '1234567890',
            nationality: 'Nepali',
            user_type: 'admin',
            is_admin: 1,
            is_verified: 1
        };

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);

        // Check if admin user already exists
        const [existingUsers] = await pool.query(
            'SELECT user_id FROM Users WHERE email = ?',
            [adminUser.email]
        );

        if (existingUsers.length > 0) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Insert admin user
        const [result] = await pool.query(
            `INSERT INTO Users (
                name,
                email,
                password,
                phone_number,
                nationality,
                user_type,
                is_admin,
                is_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                adminUser.name,
                adminUser.email,
                hashedPassword,
                adminUser.phone_number,
                adminUser.nationality,
                adminUser.user_type,
                adminUser.is_admin,
                adminUser.is_verified
            ]
        );

        console.log('Admin user created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser(); 