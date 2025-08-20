const express = require('express');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Product = require('../models/Product');
const { deleteMultipleImages, deleteImage } = require('../utils/cloudinaryUtils');
const router = express.Router();

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private (any logged-in user can see all products)
router.get('/products', protect, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's own products
// @route   GET /api/admin/myproducts
// @access  Private (any authenticated user can see their own products)
router.get('/myproducts', protect, async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user._id }).sort({ createdAt: -1 });
    console.log(`📦 User ${req.user.name} has ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a product with image upload (any user can become a vendor)
// @route   POST /api/admin/products
// @access  Private (any authenticated user can create products)
router.post('/products', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, brand, countInStock, deliveryTime, warranty, features, specifications, tags } = req.body;

    let imageUrl = '';
    if (req.file) {
      // Cloudinary returns the URL in req.file.path
      imageUrl = req.file.path;
    } else {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // Create product with the current user as owner
    const product = new Product({
      name, description, price, originalPrice, discount,
      image: imageUrl,
      images: [imageUrl],
      category, brand, countInStock,
      deliveryTime: deliveryTime || '3-5 days',
      warranty: warranty || '1 year',
      features: features ? (typeof features === 'string' ? JSON.parse(features) : features) : [],
      specifications: specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : {},
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      owner: req.user._id  // Current user becomes the product owner
    });

    const createdProduct = await product.save();
    
    console.log('✅ Product created successfully:', {
      name: createdProduct.name,
      owner: req.user.name,
      ownerEmail: req.user.email,
      productId: createdProduct._id
    });
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// @desc    Update a product with image upload
// @route   PUT /api/admin/products/:id
// @access  Private (only product owner can edit)
router.put('/products/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check if user is the product owner
    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }

    const { name, description, price, originalPrice, discount, category, brand, countInStock, deliveryTime, warranty, features, specifications, tags, isActive } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.discount = discount !== undefined ? discount : product.discount;

    if (req.file) { // Handle image update
      // Delete old image from Cloudinary if it exists
      if (product.image && product.image !== req.file.path) {
        await deleteImage(product.image);
      }
      
      // Cloudinary returns the URL in req.file.path
      product.image = req.file.path;
      if (!product.images.includes(product.image)) {
        product.images.push(product.image);
      }
    }

    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.deliveryTime = deliveryTime || product.deliveryTime;
    product.warranty = warranty || product.warranty;
    product.features = features ? (typeof features === 'string' ? JSON.parse(features) : features) : product.features;
    product.specifications = specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : product.specifications) : product.specifications;
    product.tags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : product.tags) : product.tags;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private (only product owner can delete)
router.delete('/products/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the product owner
    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      const imageUrlsToDelete = product.images;
      await deleteMultipleImages(imageUrlsToDelete);
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// @desc    Get product by ID (product owner view)
// @route   GET /api/admin/products/:id
// @access  Private (only product owner can view)
router.get('/products/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the product owner
    if (product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only view your own products' });
    }

    res.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

module.exports = router;
