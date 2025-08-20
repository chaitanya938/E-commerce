require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing Gmail Configuration...\n');

// Check environment variables
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('🔑 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('\n❌ Missing environment variables!');
  console.log('Please check your .env file.');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test connection
async function testGmail() {
  try {
    console.log('\n🔄 Testing Gmail connection...');
    
    // Verify credentials
    await transporter.verify();
    console.log('✅ Gmail connection successful!');
    
    // Test sending email
    console.log('\n📤 Testing email sending...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Gmail Test - E-commerce App',
      text: 'This is a test email to verify Gmail configuration works.',
      html: '<h2>Gmail Test Successful!</h2><p>Your email configuration is working correctly.</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Check your inbox for the test email.');
    
  } catch (error) {
    console.log('\n❌ Gmail test failed:');
    console.log('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔑 Authentication failed. Check:');
      console.log('1. Email address is correct (full gmail.com)');
      console.log('2. App Password is correct (16 characters)');
      console.log('3. 2-Step Verification is enabled');
      console.log('4. No spaces in App Password');
    }
  }
}

testGmail();
