import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const MyProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    }
  }, [user]);

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/admin/myproducts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my products:', error);
      toast.error('Failed to fetch your products');
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product deleted successfully!');
        fetchMyProducts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-2">Manage the products you've added to the marketplace</p>
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <FaPlus />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaPlus className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              You haven't added any products yet!
            </h3>
            <p className="text-gray-600">
              Start selling by adding your first product to the marketplace!
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4 transition-colors"
            >
              <FaPlus />
              <span>Add Your First Product</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  
                  {/* Product Status */}
                  <div className="text-sm text-gray-500 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Pricing Details */}
                  <div className="mb-3">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        {product.discount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="space-y-1 mb-4 text-xs text-gray-500">
                    {product.brand && (
                      <div className="flex justify-between">
                        <span>Brand:</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                    )}
                    {product.category && (
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className="font-medium">{product.countInStock}</span>
                    </div>
                    {product.deliveryTime && (
                      <div className="flex justify-between">
                        <span>Delivery:</span>
                        <span className="font-medium">{product.deliveryTime}</span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex justify-between">
                        <span>Warranty:</span>
                        <span className="font-medium">{product.warranty}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                        {product.features.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.features.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/product/${product._id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaEye />
                      <span>View</span>
                    </Link>
                    <Link
                      to={`/admin/edit/${product._id}`}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProductsPage;
