const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const makeFirstUserAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the first user
    const firstUser = await User.findOne().sort({ createdAt: 1 });
    
    if (!firstUser) {
      console.log('No users found in the database');
      return;
    }

    // Make the first user an admin
    firstUser.isAdmin = true;
    await firstUser.save();
    
    console.log(`User "${firstUser.name}" (${firstUser.email}) is now an admin!`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeFirstUserAdmin();
