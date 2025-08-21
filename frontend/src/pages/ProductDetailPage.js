import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, buyNow } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.countInStock) {
      addItem({ ...product, quantity });
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = () => {
    if (quantity > 0 && quantity <= product.countInStock) {
      // Create a temporary item for direct purchase
      const tempItem = { ...product, quantity };
      buyNow(tempItem);
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <FaArrowLeft className="mr-2" />
          Back to Products
        </button>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Product Image */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm sm:text-base text-gray-600">
                ({product.numReviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-primary-600">
                  ₹{product.price}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-lg sm:text-xl text-gray-500 line-through">
                      ₹{product.originalPrice || product.price}
                    </span>
                    <span className="text-sm sm:text-base bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              {product.brand && (
                <p className="text-sm sm:text-base text-gray-600">Brand: {product.brand}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
              {product.description}
            </p>

            {/* Product Details */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {product.category && (
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <span className="font-medium w-20 sm:w-24">Category:</span>
                  <span className="capitalize">{product.category}</span>
                </div>
              )}
              {product.countInStock !== undefined && (
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <span className="font-medium w-20 sm:w-24">Stock:</span>
                  <span className={product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}>
                    {product.countInStock > 0 ? `${product.countInStock} available` : 'Out of stock'}
                  </span>
                </div>
              )}
              {product.deliveryTime && (
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <span className="font-medium w-20 sm:w-24">Delivery:</span>
                  <span>🚚 {product.deliveryTime}</span>
                </div>
              )}
              {product.warranty && (
                <div className="flex items-center text-sm sm:text-base text-gray-600">
                  <span className="font-medium w-20 sm:w-24">Warranty:</span>
                  <span>🛡️ {product.warranty}</span>
                </div>
              )}
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Key Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Specifications:</h3>
                <div className="space-y-1">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex text-sm sm:text-base">
                      <span className="font-medium text-gray-600 w-24 sm:w-32">{spec.key}:</span>
                      <span className="text-gray-800">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs sm:text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vendor Information */}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Vendor Information:</h3>
              <p className="text-sm sm:text-base text-blue-700">
                This product is sold by <span className="font-medium">{product.owner?.name || 'Unknown Vendor'}</span>
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label className="text-sm sm:text-base font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-gray-900 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    disabled={quantity >= product.countInStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-base sm:text-lg font-medium"
                >
                  <FaShoppingCart />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.countInStock === 0}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base sm:text-lg font-medium"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Reviews & Ratings</h2>
          
          {/* Review Form */}
          <div className="mb-6 sm:mb-8">
            <ReviewForm 
              productId={product._id}
              onReviewSubmit={(newRating, newNumReviews) => {
                // Update product rating and review count
                setProduct(prev => ({
                  ...prev,
                  rating: newRating,
                  numReviews: newNumReviews
                }));
              }}
              onReviewUpdate={(newRating, newNumReviews) => {
                // Update product rating and review count
                setProduct(prev => ({
                  ...prev,
                  rating: newRating,
                  numReviews: newNumReviews
                }));
              }}
            />
          </div>

          {/* Reviews List */}
          <ReviewList 
            productId={product._id}
            productRating={product.rating}
            numReviews={product.numReviews}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
