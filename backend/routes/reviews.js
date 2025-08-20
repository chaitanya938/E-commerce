const express = require('express');
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');
const Product = require('../models/Product');
const router = express.Router();

// @desc    Create or update a product review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide productId, rating, and comment' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ user: req.user._id, product: productId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      review.createdAt = Date.now();
    } else {
      // Create new review
      review = new Review({
        user: req.user._id,
        product: productId,
        rating,
        comment
      });
    }

    await review.save();

    // Update product rating and review count
    const reviews = await Review.find({ product: productId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    product.rating = Math.round(averageRating * 10) / 10; // Round to 1 decimal place
    product.numReviews = reviews.length;
    await product.save();

    // Populate user info for response
    await review.populate('user', 'name');

    res.json({
      message: review.rating === rating ? 'Review updated successfully' : 'Review created successfully',
      review,
      productRating: product.rating,
      numReviews: product.numReviews
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's review for a specific product
// @route   GET /api/reviews/product/:productId/user
// @access  Private
router.get('/product/:productId/user', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ 
      user: req.user._id, 
      product: req.params.productId 
    });

    res.json(review);
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.deleteOne();

    // Update product rating and review count
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: review.product });
    
    if (reviews.length === 0) {
      product.rating = 0;
      product.numReviews = 0;
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      product.rating = Math.round(averageRating * 10) / 10;
      product.numReviews = reviews.length;
    }
    
    await product.save();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
