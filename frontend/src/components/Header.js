import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaTrash, FaMinus, FaPlus, FaSpinner, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { items, total, removeItem, removeItemById, updateQuantity, addItem, loading } = useCart();
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <header className="bg-white shadow-md relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-600">Multi Vendor Shop</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
          </nav>

          {/* Right side - Auth & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Debug Info (simplified) - Hidden on mobile */}
            {process.env.NODE_ENV === 'development' && (
              <div className="hidden sm:block text-xs text-gray-500 mr-2">
                User: {user?._id?.slice(-6) || 'None'} | Cart: {items.length} items
              </div>
            )}
            
            {/* Cart with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCartDropdown(!showCartDropdown)}
                className="relative p-2 text-gray-700 hover:text-primary-600"
              >
                {loading ? (
                  <FaSpinner className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                ) : (
                  <>
                    <FaShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Cart Dropdown */}
              {showCartDropdown && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Cart</h3>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Loading cart...</p>
                      </div>
                    ) : items.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                    ) : (
                      <>
                        {/* Cart Items */}
                        <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                          {items.map((item) => {
                            // Create a unique key for each cart item
                            const uniqueKey = `${item._id}-${item.product?._id || item.product}`;
                            
                            return (
                              <div key={uniqueKey} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                                  <p className="text-xs sm:text-sm text-gray-600">₹{item.price}</p>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <button
                                    onClick={() => {
                                      // Handle both populated and unpopulated product references
                                      let productId;
                                      if (item.product && typeof item.product === 'object' && item.product._id) {
                                        // Populated product object
                                        productId = item.product._id;
                                      } else if (item.product) {
                                        // Unpopulated product ID
                                        productId = item.product;
                                      }
                                      
                                      if (productId) {
                                        handleQuantityChange(productId, item.quantity - 1);
                                      } else {
                                        console.error('No product ID found for item:', item);
                                      }
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                    disabled={loading}
                                  >
                                    <FaMinus className="h-3 w-3" />
                                  </button>
                                  <span className="text-xs sm:text-sm font-medium text-gray-900 w-6 sm:w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => {
                                      // Handle both populated and unpopulated product references
                                      let productId;
                                      if (item.product && typeof item.product === 'object' && item.product._id) {
                                        // Populated product object
                                        productId = item.product._id;
                                      } else if (item.product) {
                                        // Unpopulated product ID
                                        productId = item.product;
                                      }
                                      
                                      if (productId) {
                                        handleQuantityChange(productId, item.quantity + 1);
                                      } else {
                                        console.error('No product ID found for item:', item);
                                      }
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                    disabled={loading}
                                  >
                                    <FaPlus className="h-3 w-3" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => {
                                    // Handle both populated and unpopulated product references
                                    let productId;
                                    if (item.product && typeof item.product === 'object' && item.product._id) {
                                      // Populated product object
                                      productId = item.product._id;
                                    } else if (item.product) {
                                      // Unpopulated product ID
                                      productId = item.product;
                                    }
                                    
                                    console.log('🗑️ Remove button clicked for item:', item);
                                    console.log('🗑️ Complete item structure:', JSON.stringify(item, null, 2));
                                    console.log('🗑️ Item keys:', Object.keys(item));
                                    console.log('🗑️ Extracted productId:', productId);
                                    console.log('🗑️ Item.product:', item.product);
                                    console.log('🗑️ Item.product type:', typeof item.product);
                                    
                                    if (productId) {
                                      console.log('🗑️ Calling removeItem with productId:', productId);
                                      handleRemoveItem(productId);
                                    } else {
                                      console.error('❌ No product ID found for item:', item);
                                      // Use cart item ID as fallback
                                      if (item._id) {
                                        console.log('🗑️ Using cart item ID as fallback:', item._id);
                                        removeItemById(item._id);
                                      } else {
                                        console.error('❌ No cart item ID found either');
                                      }
                                    }
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Remove item"
                                  disabled={loading}
                                >
                                  <FaTrash className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Cart Total */}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-900">Total:</span>
                            <span className="font-bold text-lg text-primary-600">₹{total.toFixed(2)}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <Link
                              to="/checkout"
                              onClick={() => setShowCartDropdown(false)}
                              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 text-center block"
                            >
                              Checkout
                            </Link>
                            <button
                              onClick={() => setShowCartDropdown(false)}
                              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300"
                            >
                              Continue Shopping
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-3 text-gray-700 hover:text-primary-600 active:text-primary-700 touch-manipulation"
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>

            {/* Desktop Auth - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin"
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                  >
                    Add Product
                  </Link>
                  <Link
                    to="/myproducts"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    My Products
                  </Link>
                  <div className="flex items-center space-x-2">
                    <FaUser className="h-5 w-5 text-gray-700" />
                    <span className="text-sm text-gray-700">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className="block text-gray-700 hover:text-primary-600 px-3 py-3 rounded-md text-base font-medium active:bg-gray-100 touch-manipulation"
              >
                Home
              </Link>
            </nav>

            {/* Mobile Auth */}
            {isAuthenticated ? (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Link
                  to="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full bg-purple-600 text-white px-4 py-4 rounded-md text-base font-medium hover:bg-purple-700 active:bg-purple-800 text-center touch-manipulation transition-colors duration-200"
                >
                  Add Product
                </Link>
                <Link
                  to="/myproducts"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full bg-blue-600 text-white px-4 py-4 rounded-md text-base font-medium hover:bg-blue-700 active:bg-blue-800 text-center touch-manipulation transition-colors duration-200"
                >
                  My Products
                </Link>
                <div className="flex items-center justify-center space-x-2 py-3 px-3 bg-gray-50 rounded-md">
                  <FaUser className="h-5 w-5 text-gray-700" />
                  <span className="text-base text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-gray-700 hover:text-red-600 active:text-red-700 px-4 py-4 rounded-md text-base font-medium border-2 border-gray-300 hover:border-red-300 active:border-red-400 touch-manipulation transition-all duration-200"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-gray-700 hover:text-primary-600 active:text-primary-700 px-4 py-4 rounded-md text-base font-medium text-center border-2 border-gray-300 hover:border-primary-300 active:border-primary-400 touch-manipulation transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full bg-primary-600 text-white px-4 py-4 rounded-md text-base font-medium hover:bg-primary-700 active:bg-primary-800 text-center touch-manipulation transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close cart dropdown and mobile menu */}
      {(showCartDropdown || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40 touch-none"
          onClick={() => {
            setShowCartDropdown(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
