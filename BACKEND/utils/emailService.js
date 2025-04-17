import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true // Enable debug logging
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP configuration error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

// Email template for guide verification status
const createVerificationEmail = (guideName, status, message) => {
    const subject = `Guide Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`;
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Guide Verification Update</h2>
            <p>Dear ${guideName},</p>
            <p>Your guide verification has been <strong>${status}</strong>.</p>
            ${message ? `<p>${message}</p>` : ''}
            ${status === 'approved' 
                ? `<p>You can now log in to your account and start using the platform.</p>` 
                : `<p>Please contact support if you need more information about the rejection.</p>`
            }
            <p>Best regards,<br>Yatra Nepal Team</p>
        </div>
    `;
    return { subject, htmlContent };
};

// Function to send verification status email
export const sendVerificationEmail = async (guideEmail, guideName, status, message = '') => {
    console.log('Attempting to send email to:', guideEmail);
    console.log('Email configuration:', {
        from: process.env.EMAIL_USER,
        to: guideEmail,
        status: status
    });

    try {
        const { subject, htmlContent } = createVerificationEmail(guideName, status, message);
        
        const mailOptions = {
            from: {
                name: 'Yatra Nepal',
                address: process.env.EMAIL_USER
            },
            to: guideEmail,
            subject: subject,
            html: htmlContent
        };

        console.log('Sending email with options:', {
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        return true;
    } catch (error) {
        console.error('Detailed email sending error:', {
            error: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        });
        throw error;
    }
};

export default {
    sendVerificationEmail
}; 