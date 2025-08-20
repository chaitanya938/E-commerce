const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOrderConfirmationMessage = async (phoneNumber, userName, orderDetails) => {
  try {
    // Remove non-digits and add country code from env or default to '91' (India) if not provided
    let formattedPhone = String(phoneNumber || '').replace(/\D/g, '');
    const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '91';
    if (!formattedPhone.startsWith(defaultCountryCode)) {
      formattedPhone = defaultCountryCode + formattedPhone;
    }

    const message = `🎉 Order Confirmation!

Hi ${userName}, your order has been successfully placed!

📦 Order ID: ${orderDetails._id}
💰 Total Amount: ₹${orderDetails.totalPrice}
💳 Payment Method: ${orderDetails.paymentMethod}
📅 Order Date: ${new Date(orderDetails.createdAt).toLocaleDateString()}

We'll keep you updated on your order status. Thank you for shopping with us! 🛍️

Best regards,
Your E-commerce Team`;

    // If TWILIO_PHONE_NUMBER starts with 'whatsapp:', send via WhatsApp. Otherwise send SMS
    const from = process.env.TWILIO_PHONE_NUMBER;
    const isWhatsApp = typeof from === 'string' && from.startsWith('whatsapp:');
    const to = isWhatsApp ? `whatsapp:+${formattedPhone}` : `+${formattedPhone}`;

    const result = await client.messages.create({ body: message, from, to });

    console.log('Order confirmation message sent: ', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation message: ', error);
    return false;
  }
};

module.exports = { sendOrderConfirmationMessage };
