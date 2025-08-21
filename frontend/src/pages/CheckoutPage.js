import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import { FaMapMarkerAlt, FaMoneyBillWave, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, total, clearCart, loadCart } = useCart();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
    // Check if this is a buy now purchase (single item, not from regular cart)
    if (items.length === 1 && !items[0]._id) {
      setIsBuyNowMode(true);
    }
  }, [items]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/api/payment/methods');
      setPaymentMethods(response.data.methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotals = () => {
    const itemsPrice = total;
    const taxPrice = itemsPrice * 0.18; // 18% GST (Indian tax rate)
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping over ₹500, ₹50 below
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    return {
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    };
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phoneNumber) {
      toast.error('Please fill in all shipping address fields including phone number');
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      
      const orderData = {
        orderItems: items.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item.product || item._id // Use product field for buy now, _id for cart items
        })),
        shippingAddress,
        paymentMethod,
        ...totals
      };

      if (paymentMethod === 'COD') {
        // Place order directly for COD
        await placeOrder(orderData);
      } else if (paymentMethod === 'Stripe') {
        // Handle Stripe payment
        await handleStripePayment(orderData);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData);
      
      if (isBuyNowMode) {
        // For buy now purchases, restore the original cart
        await loadCart();
        toast.success('Order placed successfully!');
      } else {
        // For regular cart purchases, clear the cart
        clearCart();
        toast.success('Order placed successfully!');
      }
      
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (error) {
      throw error;
    }
  };

  // Razorpay removed per user preference

  const handleStripePayment = async (orderData) => {
    try {
      // Create Stripe checkout session with INR currency for Indian payments
      const { data } = await api.post('/api/payment/create-stripe-session', {
        amount: orderData.totalPrice,
        currency: 'inr' // Use INR for Indian payments
      });

      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) toast.error('Payment failed');
    } catch (error) {
      throw error;
    }
  };

  const totals = calculateTotals();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No items to checkout</h2>
          <p className="text-gray-600 mb-4">
            {isBuyNowMode 
              ? "Please select a product to purchase directly."
              : "Add some products to your cart before checkout."
            }
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Summary</h2>
              {isBuyNowMode && (
                <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Direct Purchase
                </span>
              )}
            </div>
            
            {/* Cart Items */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {items.map((item, index) => (
                <div key={item._id || `buy-now-${index}`} className="flex items-center space-x-3 sm:space-x-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Order Totals</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base">Items:</span>
                  <span className="text-sm sm:text-base">₹{totals.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base">GST (18%):</span>
                  <span className="text-sm sm:text-base">₹{totals.taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base">Shipping:</span>
                  <span className="text-sm sm:text-base">{totals.shippingPrice === 0 ? 'Free' : `₹${totals.shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Total:</span>
                    <span>₹{totals.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Checkout Form */}
          <div className="lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 sm:mb-8">Checkout Information</h2>
            
            {/* Indian Payment Methods Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="text-blue-600 text-base sm:text-lg">💳</div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">Secure Payment Methods Available!</h3>
                  <p className="text-xs sm:text-sm text-blue-700 mb-2">
                    Pay easily with <strong>Credit/Debit Cards</strong> and <strong>Digital Wallets</strong>!
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Visa</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Mastercard</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">American Express</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">RuPay</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Google Pay*</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    *Google Pay will appear automatically if enabled in Stripe and supported by your device
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary-600" />
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="PIN Code"
                    value={shippingAddress.postalCode}
                    onChange={handleAddressChange}
                    className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number (for delivery & communication)"
                  value={shippingAddress.phoneNumber}
                  onChange={handleAddressChange}
                  className="border border-gray-300 rounded-lg px-3 py-3 sm:py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {method.id === 'COD' && <FaMoneyBillWave className="text-green-600" />}
                        {method.id === 'Stripe' && <FaGlobe className="text-purple-600" />}
                        <span className="font-medium text-sm sm:text-base">{method.name}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mb-2">{method.description}</div>
                      {method.supportedMethods && (
                        <div className="mt-2">
                           {/* UPI Methods - Primary for India */}
                           <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                             <div className="font-medium text-blue-800 mb-1 text-xs">💳 Credit/Debit Cards (Primary):</div>
                             <div className="flex flex-wrap gap-1 sm:gap-2">
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Visa</span>
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Mastercard</span>
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">American Express</span>
                               <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">RuPay</span>
                             </div>
                           </div>
                           {/* Other Payment Methods */}
                           <div className="text-xs text-gray-600">
                             <div className="font-medium mb-1">Digital Wallets (Auto-detected):</div>
                             <div className="grid grid-cols-1 gap-1">
                               <div className="flex items-center">
                                 <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                 Google Pay (if enabled & supported)
                               </div>
                               <div className="flex items-center">
                                 <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                 Apple Pay (if enabled & supported)
                               </div>
                             </div>
                           </div>
                          {method.note && (
                            <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200 mt-2">
                              ✅ {method.note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base sm:text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Place Order - ₹${totals.totalPrice.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
