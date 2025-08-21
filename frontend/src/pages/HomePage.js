import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaStar, FaSearch, FaFilter, FaPlus } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { addItem, buyNow } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products from:', '/api/products');
      console.log('🔍 Full URL will be:', 'https://multivendor-ecommerce-shop-030g.onrender.com/api/products');
      const response = await api.get('/api/products');
      console.log('✅ Products fetched successfully:', response.data);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      console.error('❌ Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (product) => {
    buyNow(product);
    toast.success(`Proceeding to checkout with ${product.name}!`);
    // Navigate to checkout with the temporary buy now item
    navigate('/checkout');
  };

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === '' || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Welcome to Multi Vendor Shop
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
          Discover amazing products with the best prices and quality. Shop with confidence!
        </p>
        
        {/* Add Product Button for logged-in users */}
        {isAuthenticated && (
          <div className="flex justify-center">
            <Link
              to="/admin"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors text-base sm:text-lg font-medium"
            >
              <FaPlus />
              <span>Add Your Product</span>
            </Link>
          </div>
        )}
        
        {/* Multi-vendor info */}
        <div className="mt-4 sm:mt-6 text-center px-4">
          <p className="text-sm text-gray-500">
            🛍️ <strong>Multi-Vendor Marketplace:</strong> Anyone can sell products here! 
            {!isAuthenticated && (
              <Link to="/login" className="text-purple-600 hover:text-purple-700 ml-1 underline">
                Login to start selling
              </Link>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 sm:mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto px-4 sm:px-0">
          <FaSearch className="absolute left-7 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 sm:pl-10 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4 sm:px-0">
          {/* Category Filter */}
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <FaFilter className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="text-gray-600 text-sm sm:text-base">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/product/${product._id}`}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 sm:h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            <div className="p-3 sm:p-4">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs sm:text-sm text-gray-600">
                  ({product.numReviews})
                </span>
              </div>
              
              {/* Price */}
              <div className="mb-3">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl sm:text-2xl font-bold text-primary-600">
                      ₹{product.price}
                    </span>
                    {product.discount > 0 && (
                      <>
                        <span className="text-sm sm:text-lg text-gray-500 line-through">
                          ₹{product.originalPrice || product.price}
                        </span>
                        <span className="text-xs sm:text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          {product.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {product.brand && (
                    <span className="text-xs sm:text-sm text-gray-500">by {product.brand}</span>
                  )}
                  {/* Vendor Information */}
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span>Vendor: </span>
                    <span className="font-medium text-blue-600">
                      {product.owner?.name || 'Unknown Vendor'}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                {product.deliveryTime && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="mr-2">🚚</span>
                    {product.deliveryTime}
                  </div>
                )}
                {product.warranty && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <span className="mr-2">🛡️</span>
                    {product.warranty} warranty
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.countInStock === 0}
                  className="w-full sm:flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleBuyNow(product)}
                  disabled={product.countInStock === 0}
                  className="w-full sm:flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
