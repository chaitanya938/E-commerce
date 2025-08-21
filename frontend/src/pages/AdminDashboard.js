import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes,
  FaSave,
  FaTag,
  FaShoppingCart
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    image: null,
    images: [],
    category: '',
    brand: '',
    countInStock: '',
    deliveryTime: '3-5 days',
    warranty: '1 year',
    features: [],
    specifications: {},
    tags: []
  });

  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchMyProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/admin/myproducts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProducts(data);
    } catch (error) {
      console.error('Error fetching my products:', error);
      toast.error('Failed to fetch my products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Handle regular fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && key !== 'images') {
          if (key === 'features' || key === 'tags') {
            // Convert arrays to JSON strings for FormData
            formDataToSend.append(key, JSON.stringify(formData[key].filter(item => item.trim() !== '')));
          } else if (key === 'specifications') {
            // Convert specifications object to JSON string
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const { data } = await api.post('/api/admin/products', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
             toast.success('Product created successfully! You can now view it in the Products page.');
       setProducts([data, ...products]);
       setMyProducts([data, ...myProducts]);
       setShowAddForm(false);
       resetForm();
       
       // Refresh products to ensure they appear in the Products page
       fetchProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Handle regular fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && key !== 'images') {
          if (key === 'features' || key === 'tags') {
            // Convert arrays to JSON strings for FormData
            formDataToSend.append(key, JSON.stringify(formData[key].filter(item => item.trim() !== '')));
          } else if (key === 'specifications') {
            // Convert specifications object to JSON string
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const { data } = await api.put(`/api/admin/products/${editingProduct._id}`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Product updated successfully!');
      setProducts(products.map(p => p._id === data._id ? data : p));
      setMyProducts(myProducts.map(p => p._id === data._id ? data : p));
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Product deleted successfully!');
        setProducts(products.filter(p => p._id !== productId));
        setMyProducts(myProducts.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      discount: product.discount || 0,
      image: null,
      images: product.images || [],
      category: product.category,
      brand: product.brand,
      countInStock: product.countInStock,
      deliveryTime: product.deliveryTime || '3-5 days',
      warranty: product.warranty || '1 year',
      features: product.features?.length > 0 ? product.features : [],
      specifications: product.specifications || {},
      tags: product.tags?.length > 0 ? product.tags : []
    });
    
    // Set image preview for existing product
    if (product.image) {
      setImagePreview(product.image);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discount: '',
      image: null,
      images: [],
      category: '',
      brand: '',
      countInStock: '',
      deliveryTime: '3-5 days',
      warranty: '1 year',
      features: [],
      specifications: {},
      tags: []
    });
    setImagePreview('');
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    resetForm();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Product Dashboard</h1>
          <p className="text-gray-600 mt-2">Add, edit, and manage your products. Anyone can buy from your store!</p>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How it works:</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• <strong>Add products</strong> - When you add a product, you become its owner</p>
                <p>• <strong>Edit/Delete</strong> - Only product owners can edit or delete their own products</p>
                <p>• <strong>Buy products</strong> - Anyone can buy products from any seller</p>
                <p>• <strong>Get notified</strong> - You'll receive emails when someone orders your products</p>
                <p>• <strong>Security</strong> - You cannot modify products owned by other users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FaPlus />
            <span>Add New Product</span>
          </button>
                     <Link
             to="/products"
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
           >
             <FaShoppingCart />
             <span>View My Products</span>
           </Link>
        </div>



        {/* Add/Edit Product Form */}
        {(showAddForm || editingProduct) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={editingProduct ? cancelEdit : () => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdate : handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Price *
                      </label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Original price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Discounted price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="countInStock"
                        value={formData.countInStock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time
                      </label>
                      <input
                        type="text"
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleInputChange}
                        placeholder="3-5 days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image *
                    </label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Supported formats: JPG, PNG, GIF, WebP. Max size: 10MB.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty
                    </label>
                    <input
                      type="text"
                      name="warranty"
                      value={formData.warranty}
                      onChange={handleInputChange}
                      placeholder="1 year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Features
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleArrayInputChange(index, 'features', e.target.value)}
                        placeholder="Enter product feature"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('features')}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                  >
                    <FaPlus size={12} />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={editingProduct ? cancelEdit : () => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center space-x-2"
                >
                  <FaSave />
                  <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* My Products Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Products (Edit/Delete)</h2>
          {myProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You haven't added any products yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProducts.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">₹{product.price}</p>
                  <p className="text-gray-500 text-xs mb-4">Stock: {product.countInStock}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <FaEdit className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    >
                      <FaTrash className="inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Products Section (Read-only) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Products (Browse & Buy)</h2>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">₹{product.price}</p>
                  <p className="text-gray-500 text-xs mb-4">Stock: {product.countInStock}</p>
                  <p className="text-gray-400 text-xs">Owner: {product.owner === user._id ? 'You' : 'Other Seller'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
