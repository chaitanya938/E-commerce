# MERN E-commerce Website

A full-stack e-commerce website built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring user authentication, product management, shopping cart, and multiple payment gateways.

## 🚀 Features

### Authentication
- User signup with name, email, phone number, and password
- User login with email and password
- JWT-based authentication
- Protected routes

### Product Management
- Product listing with search and filtering
- Product categories and ratings
- Stock management
- Product detail pages

### Shopping Experience
- Add to cart functionality
- Shopping cart management
- Buy now option for instant checkout
- Responsive product grid

### Payment Integration
- Cash on Delivery (COD)
- Razorpay integration (India)
- Stripe integration (Global)
- Secure payment processing

### Order Management
- Order confirmation
- Email notifications via Nodemailer
- WhatsApp notifications via Twilio
- Order status tracking

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Twilio** - WhatsApp messaging
- **Razorpay** - Payment gateway (India)
- **Stripe** - Payment gateway (Global)

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd mern-ecommerce
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (server + client)
npm run install-all
```

### 3. Environment Configuration

#### Backend (.env file in server directory)
Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Razorpay Configuration (India)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Stripe Configuration (Global)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### Frontend (.env file in client directory)
Create a `.env` file in the `client` directory:

```env
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 4. Database Setup
Make sure MongoDB is running and accessible. The application will automatically create the database and collections.

### 5. Seed the Database (Optional)
To populate the database with sample products:

```bash
cd server
node seed.js
```

### 6. Run the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

#### Run Backend Only
```bash
npm run server
```

#### Run Frontend Only
```bash
npm run client
```

#### Production Build
```bash
npm run build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/myorders` - Get user orders
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered

### Payment
- `GET /api/payment/methods` - Get payment methods
- `POST /api/payment/create-razorpay-order` - Create Razorpay order
- `POST /api/payment/create-stripe-intent` - Create Stripe payment intent
- `POST /api/payment/verify-razorpay` - Verify Razorpay payment

## 🔧 Configuration

### Email Service (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env` file

### Twilio WhatsApp
1. Sign up for a Twilio account
2. Get your Account SID and Auth Token
3. Set up WhatsApp messaging

### Payment Gateways
1. **Razorpay**: Sign up and get your API keys
2. **Stripe**: Create an account and get your publishable and secret keys

## 📱 Features in Detail

### User Authentication
- Secure password hashing with bcrypt
- JWT token-based authentication
- Protected routes for authenticated users
- User profile management

### Product Catalog
- Responsive product grid
- Search and filtering capabilities
- Category-based organization
- Rating and review system
- Stock availability tracking

### Shopping Cart
- Persistent cart storage (localStorage)
- Add/remove items
- Quantity management
- Real-time total calculation

### Checkout Process
- Shipping address collection
- Payment method selection
- Order summary
- Secure payment processing

### Order Management
- Order confirmation
- Email notifications
- WhatsApp notifications
- Order status tracking

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern Interface**: Clean and intuitive design
- **Loading States**: Smooth user experience
- **Toast Notifications**: User feedback
- **Form Validation**: Input validation and error handling
- **Responsive Grid**: Adaptive product layout

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- Secure payment processing

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment variables
2. Deploy to platforms like Heroku, DigitalOcean, or AWS
3. Set up MongoDB Atlas for production database

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to platforms like Netlify, Vercel, or AWS S3

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

If you have any questions or need help, please open an issue in the repository.

## 🔮 Future Enhancements

- Admin dashboard for product management
- User reviews and ratings
- Wishlist functionality
- Advanced search and filtering
- Multi-language support
- Mobile app development
- Analytics and reporting
- Inventory management system

---

**Happy Coding! 🎉**
