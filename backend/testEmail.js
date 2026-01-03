import dotenv from 'dotenv';
import { transporter } from './src/config/mail.js';

// Load environment variables
dotenv.config();

console.log('\n🧪 Testing Email Configuration...\n');
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('🔑 Password Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);

// Test email sending
const testEmail = async () => {
    try {
        console.log('\n📤 Sending test email...\n');

        const info = await transporter.sendMail({
            from: `"HireSpark Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: '✅ Test Email - HireSpark Email System',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f7fa;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #10b981;">✅ Email System Working!</h1>
            <p style="font-size: 16px; color: #4a5568;">
              Congratulations! Your HireSpark email notification system is configured correctly.
            </p>
            <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0;"><strong>Configuration Details:</strong></p>
              <p style="margin: 5px 0;">Email: ${process.env.EMAIL_USER}</p>
              <p style="margin: 5px 0;">Frontend URL: ${process.env.FRONTEND_URL}</p>
            </div>
            <p style="color: #718096; font-size: 14px;">
              This is a test email sent from HireSpark backend.
            </p>
          </div>
        </div>
      `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('\n✨ Check your inbox:', process.env.EMAIL_USER);
        console.log('\n🎉 Email system is working perfectly!\n');

    } catch (error) {
        console.error('\n❌ Error sending test email:');
        console.error(error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('  1. Check if EMAIL_USER and EMAIL_PASS are set in .env');
        console.error('  2. Verify the app password is correct (no spaces)');
        console.error('  3. Make sure 2-Step Verification is enabled on Gmail');
        console.error('  4. Try generating a new app password\n');
    }

    process.exit(0);
};

testEmail();
