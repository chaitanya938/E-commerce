import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaBox, FaCreditCard, FaMapMarkerAlt, FaCalendar, FaPhone } from 'react-icons/fa';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <FaCheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received it and will process it shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-3">
                <FaBox className="text-primary-600 mr-2" />
                <span className="font-medium">Order ID:</span>
                <span className="ml-2 text-gray-600">{order._id}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <FaCalendar className="text-primary-600 mr-2" />
                <span className="font-medium">Order Date:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center mb-3">
                <FaCreditCard className="text-primary-600 mr-2" />
                <span className="font-medium">Payment Method:</span>
                <span className="ml-2 text-gray-600">{order.paymentMethod}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-3">
                <FaMapMarkerAlt className="text-primary-600 mr-2" />
                <span className="font-medium">Shipping Address:</span>
              </div>
              <div className="ml-6 text-gray-600">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <div className="flex items-center mt-2">
                  <FaPhone className="text-primary-600 mr-2" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{order.shippingAddress.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          
          <div className="space-y-4">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">₹{(item.price * item.qty).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>₹{order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>₹{order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• We'll send you a WhatsApp message with order details</li>
            <li>• Your order will be processed and shipped within 2-3 business days</li>
            <li>• You'll receive tracking information once your order ships</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Link
            to="/"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
