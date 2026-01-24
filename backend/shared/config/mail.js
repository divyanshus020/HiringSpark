import nodemailer from 'nodemailer';
import { env } from './env.js';

// Create transporter only if credentials are provided
export const transporter = (env.EMAIL_USER && env.EMAIL_PASS)
    ? nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS, // Use App Password, not regular password
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    : null;

// Verify transporter configuration
if (transporter) {
    transporter.verify(function (error, success) {
        if (error) {
            console.log('❌ Email configuration error:', error);
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });
} else {
    console.log('⚠️ Email credentials missing in .env. Email features (like candidate notifications) will be disabled.');
}
