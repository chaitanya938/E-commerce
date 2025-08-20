#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MERN E-commerce Project...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm version: ${npmVersion.trim()}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

// Create .env files if they don't exist
const serverEnvPath = path.join(__dirname, 'server', '.env');
const clientEnvPath = path.join(__dirname, 'client', '.env');

if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Razorpay Configuration (India)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe Configuration (Global)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
`;
  
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env file');
}

if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `# Frontend Environment Variables
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
`;
  
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env file');
}

console.log('\n📋 Next Steps:');
console.log('1. Update the .env files with your actual API keys and credentials');
console.log('2. Make sure MongoDB is running on your system');
console.log('3. Install dependencies: npm run install-all');
console.log('4. Seed the database (optional): cd server && node seed.js');
console.log('5. Start the application: npm run dev');
console.log('\n📚 Check README.md for detailed setup instructions');
console.log('\n🎉 Setup complete! Happy coding!');
