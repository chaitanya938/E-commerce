# SMS Notification Setup Guide

This guide explains how to set up SMS notifications for your e-commerce application using Twilio.

## 🎯 What This System Does

1. **Customer Order Confirmation**: Sends SMS/WhatsApp to customer when they place an order
2. **Product Owner Notification**: Sends SMS/WhatsApp to product owner when their product is ordered

## 📱 Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **Twilio Phone Number**: Purchase a phone number from Twilio
3. **Environment Variables**: Configure your `.env` file

## ⚙️ Environment Configuration

Add these variables to your `backend/.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
DEFAULT_COUNTRY_CODE=91

# For WhatsApp (optional)
TWILIO_PHONE_NUMBER=whatsapp:+1234567890
```

### How to Get Twilio Credentials:

1. **Account SID**: Found in your Twilio Console dashboard
2. **Auth Token**: Found in your Twilio Console dashboard
3. **Phone Number**: The number you purchased from Twilio
4. **Country Code**: Default country code for phone numbers (91 for India)

## 🚀 How It Works

### 1. Customer Places Order
- Customer fills checkout form with phone number
- Order is created in database
- **SMS/WhatsApp sent to customer** with order confirmation
- **SMS/WhatsApp sent to product owner** with order details

### 2. Message Content

#### Customer Message:
```
🎉 Order Confirmation!

Hi [Customer Name], your order has been successfully placed!

📦 Order ID: [Order ID]
💰 Total Amount: ₹[Amount]
💳 Payment Method: [Payment Method]
📅 Order Date: [Date]

We'll keep you updated on your order status. Thank you for shopping with us! 🛍️

Best regards,
Your E-commerce Team
```

#### Owner Message:
```
🛍️ New Order Received!

Hi [Owner Name], you have received a new order!

📦 Product: [Product Name]
🔢 Quantity: [Quantity]
💰 Price: ₹[Price]
📋 Order ID: [Order ID]
👤 Customer: [Customer Name]
📱 Customer Phone: [Customer Phone]
📅 Order Date: [Date]

Please process this order as soon as possible. Thank you! 🚀

Best regards,
Your E-commerce Team
```

## 🧪 Testing

Run the test script to verify SMS functionality:

```bash
cd backend
node test-sms.js
```

This will test both customer and owner notifications.

## 📋 File Structure

```
backend/
├── utils/
│   ├── whatsappService.js          # Customer notifications
│   ├── ownerNotificationService.js  # Owner notifications
│   └── emailService.js             # Email notifications
├── routes/
│   └── orders.js                   # Order creation with notifications
└── test-sms.js                     # Test script
```

## 🔧 Customization

### Change Message Format
Edit the message templates in:
- `whatsappService.js` for customer messages
- `ownerNotificationService.js` for owner messages

### Change Currency
Update the currency symbol from ₹ to your preferred currency in both service files.

### Add More Fields
You can add more order details to the messages by modifying the service files and passing additional data.

## 🚨 Troubleshooting

### Common Issues:

1. **"Invalid phone number"**
   - Check if phone numbers include country code
   - Verify `DEFAULT_COUNTRY_CODE` is set correctly

2. **"Authentication failed"**
   - Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
   - Check if credentials are correct

3. **"Phone number not verified"**
   - In Twilio trial accounts, verify recipient phone numbers
   - Upgrade to paid account for production use

4. **"Message not delivered"**
   - Check Twilio Console for delivery status
   - Verify phone number format

### Debug Steps:

1. Check console logs for error messages
2. Verify environment variables are loaded
3. Test with Twilio's test credentials first
4. Check Twilio Console for message logs

## 💰 Costs

- **Twilio SMS**: ~$0.0075 per message (US numbers)
- **Twilio WhatsApp**: ~$0.005 per message
- **Phone Number**: ~$1/month per number

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use environment variables for sensitive data
- Regularly rotate Twilio auth tokens
- Monitor Twilio usage and costs

## 📞 Support

- **Twilio Support**: [support.twilio.com](https://support.twilio.com)
- **Documentation**: [twilio.com/docs](https://www.twilio.com/docs)
- **Community**: [twilio.com/community](https://www.twilio.com/community)
