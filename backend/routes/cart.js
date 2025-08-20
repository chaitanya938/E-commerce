const express = require('express');
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      // Create empty cart if none exists
      cart = new Cart({
        user: req.user._id,
        items: [],
        total: 0
      });
      await cart.save();
    }
    
    // Ensure proper population and structure
    if (cart.items.length > 0) {
      cart = await Cart.findById(cart._id).populate('items.product');
      
      console.log('🔍 Backend: Cart items structure being sent to frontend:');
      cart.items.forEach((item, index) => {
        console.log(`🔍 Item ${index}:`, {
          _id: item._id,
          product: item.product,
          productType: typeof item.product,
          productId: item.product?._id || item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
      });
      
      // Check if any items are missing the product field and try to fix them
      const itemsToFix = cart.items.filter(item => !item.product);
      if (itemsToFix.length > 0) {
        console.log('🔧 Backend: Found', itemsToFix.length, 'items missing product field, attempting to fix...');
        
        for (const item of itemsToFix) {
          try {
            console.log('🔧 Backend: Attempting to fix item:', item.name, 'Price:', item.price);
            
            // Try to find the product by name and price
            const product = await Product.findOne({
              name: item.name,
              price: item.price
            });
            
            if (product) {
              console.log('🔧 Backend: Found product for item:', item.name, 'Product ID:', product._id);
              // Update the cart item with the product reference
              item.product = product._id;
            } else {
              console.log('❌ Backend: Could not find product for item:', item.name, 'Price:', item.price);
              
              // Try to find by name only (case-insensitive)
              const productByName = await Product.findOne({
                name: { $regex: new RegExp(item.name, 'i') }
              });
              
              if (productByName) {
                console.log('🔧 Backend: Found product by name (case-insensitive):', productByName.name, 'Price:', productByName.price, 'Product ID:', productByName._id);
                console.log('🔧 Backend: Price mismatch - Cart item price:', item.price, 'vs Product price:', productByName.price);
              } else {
                console.log('❌ Backend: No product found even by name');
                
                // Show all available products for debugging
                const allProducts = await Product.find({}, 'name price');
                console.log('🔍 Backend: Available products in database:', allProducts.map(p => ({ name: p.name, price: p.price })));
              }
            }
          } catch (error) {
            console.error('❌ Backend: Error fixing cart item:', error);
          }
        }
        
        // Save the updated cart
        await cart.save();
        console.log('🔧 Backend: Cart updated with product references');
        
        // Repopulate the cart
        cart = await Cart.findById(cart._id).populate('items.product');
      }
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
router.post('/items', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        user: req.user._id,
        items: [],
        total: 0
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );
    
    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        productId: productId, // Store the actual product ID separately
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      });
      
      console.log('➕ Backend: Added new cart item:', {
        product: productId,
        productType: typeof productId,
        name: product.name,
        price: product.price,
        quantity
      });
    }
    
    await cart.save();
    
    // Populate product details before sending response
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    
    res.json(populatedCart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/items/:productId
// @access  Private
router.put('/items/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId.toString()
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
router.delete('/items/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('🗑️ Backend: Attempting to remove productId:', productId);
    console.log('🗑️ Backend: productId type:', typeof productId);
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      console.log('🗑️ Backend: Cart not found for user:', req.user._id);
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    console.log('🗑️ Backend: Cart items before removal:', cart.items.map(item => ({
      _id: item._id,
      product: item.product,
      productType: typeof item.product,
      productString: item.product?.toString() || 'null',
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      // Check if this is a valid cart item
      hasProductField: item.hasOwnProperty('product'),
      allFields: Object.keys(item)
    })));
    
    // Try to remove by product ID first, then by cart item ID as fallback
    let itemsRemoved = 0;
    
    // Method 1: Remove by product ID (if product field exists)
    cart.items = cart.items.filter(item => {
      if (item.product) {
        const itemProductId = item.product._id ? item.product._id.toString() : item.product.toString();
        const targetProductId = productId.toString();
        const shouldRemove = itemProductId === targetProductId;
        if (shouldRemove) itemsRemoved++;
        return !shouldRemove;
      }
      return true; // Keep items without product field for now
    });
    
    // Method 2: If no items were removed by product ID, try by cart item ID
    if (itemsRemoved === 0) {
      console.log('🗑️ Backend: No items removed by product ID, trying by cart item ID');
      cart.items = cart.items.filter(item => {
        const shouldRemove = item._id.toString() === productId.toString();
        if (shouldRemove) itemsRemoved++;
        return !shouldRemove;
      });
    }
    
    console.log('🗑️ Backend: Items removed:', itemsRemoved);
    console.log('🗑️ Backend: Cart items after removal:', cart.items.length);
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    console.log('🗑️ Backend: Sending response with', populatedCart.items.length, 'items');
    res.json(populatedCart);
  } catch (error) {
    console.error('❌ Backend: Error removing cart item:', error);
    res.status(500).json({ message: 'Error removing cart item' });
  }
});

// @desc    Remove item from cart by cart item ID
// @route   DELETE /api/cart/item/:cartItemId
// @access  Private
router.delete('/item/:cartItemId', protect, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    console.log('🗑️ Backend: Attempting to remove cart item by ID:', cartItemId);
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      console.log('🗑️ Backend: Cart not found for user:', req.user._id);
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    console.log('🗑️ Backend: Cart items before removal:', cart.items.map(item => ({
      _id: item._id,
      name: item.name,
      price: item.price
    })));
    
    // Remove item by cart item ID
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(item => item._id.toString() !== cartItemId.toString());
    const itemsRemoved = initialLength - cart.items.length;
    
    console.log('🗑️ Backend: Items removed:', itemsRemoved);
    console.log('🗑️ Backend: Cart items after removal:', cart.items.length);
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    console.log('🗑️ Backend: Sending response with', populatedCart.items.length, 'items');
    res.json(populatedCart);
  } catch (error) {
    console.error('❌ Backend: Error removing cart item by ID:', error);
    res.status(500).json({ message: 'Error removing cart item' });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

// @desc    Set cart for buy now (replace entire cart)
// @route   POST /api/cart/buy-now
// @access  Private
router.post('/buy-now', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      // Create new cart if none exists
      cart = new Cart({
        user: req.user._id,
        items: [],
        total: 0
      });
    }
    
    // Replace entire cart with single item
    cart.items = [{
      product: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    }];
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.product');
    res.json(populatedCart);
  } catch (error) {
    console.error('Error setting buy now cart:', error);
    res.status(500).json({ message: 'Error setting buy now cart' });
  }
});

module.exports = router;
