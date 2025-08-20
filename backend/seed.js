const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');

dotenv.config();

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and long battery life.',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    category: 'Electronics',
    brand: 'AudioTech',
    rating: 4.5,
    numReviews: 128,
    countInStock: 50
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    category: 'Electronics',
    brand: 'FitTech',
    rating: 4.3,
    numReviews: 89,
    countInStock: 30
  },
  {
    name: 'Premium Coffee Maker',
    description: 'Professional coffee maker with programmable settings and thermal carafe.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
    category: 'Home & Kitchen',
    brand: 'BrewMaster',
    rating: 4.7,
    numReviews: 156,
    countInStock: 25
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly cotton t-shirt available in multiple colors.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    category: 'Clothing',
    brand: 'EcoWear',
    rating: 4.2,
    numReviews: 67,
    countInStock: 100
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof portable speaker with 360-degree sound and 20-hour battery life.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    category: 'Electronics',
    brand: 'SoundWave',
    rating: 4.6,
    numReviews: 203,
    countInStock: 75
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    category: 'Home & Kitchen',
    brand: 'HydroLife',
    rating: 4.8,
    numReviews: 312,
    countInStock: 200
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    // Check if admin user exists, if not create one
    let adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      // Create a default admin user
      adminUser = new User({
        name: 'Store Admin',
        email: 'admin@store.com',
        password: 'admin123', // This should be hashed in production
        phone: '1234567890',
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Created admin user:', adminUser.email);
    } else {
      console.log('Admin user already exists:', adminUser.email);
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add owner field to all products
    const productsWithOwner = sampleProducts.map(product => ({
      ...product,
      owner: adminUser._id
    }));

    // Insert sample products with owner
    const createdProducts = await Product.insertMany(productsWithOwner);
    console.log(`Inserted ${createdProducts.length} products with owner: ${adminUser.name}`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
