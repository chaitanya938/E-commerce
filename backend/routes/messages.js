const express = require('express');
const { protect } = require('../middleware/auth');
const Message = require('../models/Message');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, message, messageType = 'buyer_to_owner' } = req.body;

    const order = await Order.findById(orderId).populate('orderItems.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Determine recipient based on message type
    let recipient;
    if (messageType === 'buyer_to_owner') {
      // Buyer sending message to product owner
      const product = await Product.findById(order.orderItems[0].product);
      recipient = product.owner;
    } else if (messageType === 'owner_to_buyer') {
      // Product owner sending message to buyer
      recipient = order.user;
    }

    const newMessage = new Message({
      order: orderId,
      sender: req.user._id,
      recipient,
      message,
      messageType
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// @desc    Get messages for an order
// @route   GET /api/messages/order/:orderId
// @access  Private
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is involved in this order (buyer or product owner)
    const product = await Product.findById(order.orderItems[0].product);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (order.user.toString() !== req.user._id.toString() && 
        product.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ order: req.params.orderId })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// @desc    Get all messages for a user
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .populate('order', 'orderItems')
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.isRead = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Message update error:', error);
    res.status(500).json({ message: 'Error updating message' });
  }
});

module.exports = router;
