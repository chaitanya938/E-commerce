const nodemailer = require('nodemailer');

// createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOwnerOrderNotificationEmail = async (ownerEmail, ownerName, orderDetails, productDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      subject: 'New Order Received - Your E-commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🛍️ New Order Received!</h2>
          <p>Dear ${ownerName},</p>
          <p>Congratulations! You have received a new order for your product.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555;">Order Details:</h3>
            <p><strong>Product:</strong> ${productDetails.name}</p>
            <p><strong>Quantity:</strong> ${productDetails.qty}</p>
            <p><strong>Price:</strong> ₹${productDetails.price}</p>
            <p><strong>Order ID:</strong> ${orderDetails._id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555;">Customer Information:</h3>
            <p><strong>Customer Name:</strong> ${orderDetails.customerName}</p>
            <p><strong>Customer Phone:</strong> ${orderDetails.customerPhone}</p>
          </div>
          
          <p>Please process this order as soon as possible. You can view the complete order details in your admin dashboard.</p>
          
          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Owner notification email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending owner notification email: ', error);
    return false;
  }
};

module.exports = { sendOwnerOrderNotificationEmail };
