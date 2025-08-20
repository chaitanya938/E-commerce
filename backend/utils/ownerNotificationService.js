const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOwnerOrderNotification = async (ownerPhone, ownerName, orderDetails, productDetails) => {
  try {
    // Remove non-digits and add country code from env or default to '91' (India) if not provided
    let formattedPhone = String(ownerPhone || '').replace(/\D/g, '');
    const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '91';
    if (!formattedPhone.startsWith(defaultCountryCode)) {
      formattedPhone = defaultCountryCode + formattedPhone;
    }

    const message = `🛍️ New Order Received!

Hi ${ownerName}, you have received a new order!

📦 Product: ${productDetails.name}
🔢 Quantity: ${productDetails.qty}
💰 Price: ₹${productDetails.price}
📋 Order ID: ${orderDetails._id}
👤 Customer: ${orderDetails.customerName}
📱 Customer Phone: ${orderDetails.customerPhone}
📅 Order Date: ${new Date(orderDetails.createdAt).toLocaleDateString()}

Please process this order as soon as possible. Thank you! 🚀

Best regards,
Your E-commerce Team`;

    // If TWILIO_PHONE_NUMBER starts with 'whatsapp:', send via WhatsApp. Otherwise send SMS
    const from = process.env.TWILIO_PHONE_NUMBER;
    const isWhatsApp = typeof from === 'string' && from.startsWith('whatsapp:');
    const to = isWhatsApp ? `whatsapp:+${formattedPhone}` : `+${formattedPhone}`;

    const result = await client.messages.create({ body: message, from, to });

    console.log('Owner notification sent: ', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending owner notification: ', error);
    return false;
  }
};

module.exports = { sendOwnerOrderNotification };
