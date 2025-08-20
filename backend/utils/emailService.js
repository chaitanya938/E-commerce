const nodemailer = require('nodemailer');

// createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOrderConfirmationEmail = async (userEmail, userName, orderDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Order Confirmation - Your E-commerce Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Dear ${userName},</p>
          <p>Thank you for your order! Your order has been successfully placed.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails._id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.totalPrice}</p>
            <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555;">Shipping Address:</h3>
            <p>${orderDetails.shippingAddress.address}</p>
            <p>${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}</p>
            <p>${orderDetails.shippingAddress.country}</p>
          </div>
          
          <p>We'll send you updates on your order status. If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>Your E-commerce Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

module.exports = { sendOrderConfirmationEmail };
