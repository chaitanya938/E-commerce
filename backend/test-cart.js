const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testCartSystem() {
  try {
    console.log('🧪 Testing Database Cart System...\n');
    
    // Get a test user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    console.log(`👤 Testing with user: ${user.name} (${user._id})`);
    
    // Get a test product
    const product = await Product.findOne();
    if (!product) {
      console.log('❌ No products found in database');
      return;
    }
    console.log(`📦 Testing with product: ${product.name} (${product._id})`);
    
    // Test 1: Create/Get Cart
    console.log('\n1️⃣ Testing Cart Creation/Retrieval...');
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({
        user: user._id,
        items: [],
        total: 0
      });
      await cart.save();
      console.log('✅ New cart created');
    } else {
      console.log('✅ Existing cart found');
    }
    console.log(`📊 Cart: ${cart.items.length} items, Total: ₹${cart.total}`);
    
    // Test 2: Add Item to Cart
    console.log('\n2️⃣ Testing Add Item to Cart...');
    const addItemResponse = await fetch(`http://localhost:5000/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || 'test-token'}`
      },
      body: JSON.stringify({
        productId: product._id,
        quantity: 2
      })
    });
    
    if (addItemResponse.ok) {
      const updatedCart = await addItemResponse.json();
      console.log('✅ Item added to cart');
      console.log(`📊 Updated Cart: ${updatedCart.items.length} items, Total: ₹${updatedCart.total}`);
    } else {
      console.log('❌ Failed to add item to cart');
    }
    
    // Test 3: Update Item Quantity
    console.log('\n3️⃣ Testing Update Item Quantity...');
    const updateResponse = await fetch(`http://localhost:5000/api/cart/items/${product._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token || 'test-token'}`
      },
      body: JSON.stringify({
        quantity: 3
      })
    });
    
    if (updateResponse.ok) {
      const updatedCart = await updateResponse.json();
      console.log('✅ Item quantity updated');
      console.log(`📊 Updated Cart: ${updatedCart.items.length} items, Total: ₹${updatedCart.total}`);
    } else {
      console.log('❌ Failed to update item quantity');
    }
    
    // Test 4: Get Cart
    console.log('\n4️⃣ Testing Get Cart...');
    const getCartResponse = await fetch(`http://localhost:5000/api/cart`, {
      headers: {
        'Authorization': `Bearer ${user.token || 'test-token'}`
      }
    });
    
    if (getCartResponse.ok) {
      const cartData = await getCartResponse.json();
      console.log('✅ Cart retrieved successfully');
      console.log(`📊 Cart: ${cartData.items.length} items, Total: ₹${cartData.total}`);
      console.log('📦 Items:', cartData.items.map(item => `${item.name} (Qty: ${item.quantity})`));
    } else {
      console.log('❌ Failed to get cart');
    }
    
    // Test 5: Clear Cart
    console.log('\n5️⃣ Testing Clear Cart...');
    const clearResponse = await fetch(`http://localhost:5000/api/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token || 'test-token'}`
      }
    });
    
    if (clearResponse.ok) {
      const clearedCart = await clearResponse.json();
      console.log('✅ Cart cleared successfully');
      console.log(`📊 Cleared Cart: ${clearedCart.items.length} items, Total: ₹${clearedCart.total}`);
    } else {
      console.log('❌ Failed to clear cart');
    }
    
    console.log('\n🎉 Database Cart System Test Completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the test
testCartSystem();

