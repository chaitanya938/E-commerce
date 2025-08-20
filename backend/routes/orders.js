const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/emailService');
const { sendOwnerOrderNotificationEmail } = require('../utils/ownerEmailService');
const Message = require('../models/Message');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Create order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      }
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(
        req.user.email,
        req.user.name,
        createdOrder
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // SMS/WhatsApp notifications disabled - only email

    // Send system message and notification to product owner
    try {
      console.log('🔍 Processing order items for owner notifications...');
      for (const item of orderItems) {
        console.log(`📦 Processing item: ${item.name} (Product ID: ${item.productId || item.product})`);
        
        // Use productId if available, otherwise fall back to item.product
        const productId = item.productId || item.product;
        const product = await Product.findById(productId).populate('owner', 'name phone email');
        console.log('📋 Product found:', product ? 'Yes' : 'No');
        
        if (product && product.owner) {
          console.log('👤 Product owner found:', {
            id: product.owner._id,
            name: product.owner.name,
            email: product.owner.email
          });
          
          // Create system message
          const systemMessage = new Message({
            order: createdOrder._id,
            sender: req.user._id, // Buyer
            recipient: product.owner._id, // Product owner
            message: `New order received for ${item.name} (Qty: ${item.qty}). Order ID: ${createdOrder._id}`,
            messageType: 'system'
          });
          await systemMessage.save();
          console.log('💬 System message created successfully');

          // Send email notification to product owner
          try {
            console.log('📧 Sending owner notification email...');
            await sendOwnerOrderNotificationEmail(
              product.owner.email,
              product.owner.name,
              {
                _id: createdOrder._id,
                customerName: req.user.name,
                customerPhone: shippingAddress.phoneNumber,
                createdAt: createdOrder.createdAt
              },
              {
                name: item.name,
                qty: item.qty,
                price: item.price
              }
            );
            console.log('✅ Owner notification email sent successfully!');
          } catch (emailError) {
            console.error('❌ Owner notification email failed:', emailError);
          }
        } else {
          console.log('❌ Product or owner not found:', {
            productExists: !!product,
            ownerExists: !!(product && product.owner),
            ownerEmail: product?.owner?.email
          });
        }
      }
    } catch (messageError) {
      console.error('❌ System message creation failed:', messageError);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name owner'
      });

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
