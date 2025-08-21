import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import api from '../utils/api';

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    
    case 'ADD_ITEM':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0
      };
    
    case 'BUY_NOW':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total
      };
    
    default:
      return state;
  }
};

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  // Load cart from database when user changes
  useEffect(() => {
    if (userId) {
      loadCart();
    } else {
      // Clear cart when no user
      dispatch({ type: 'SET_CART', payload: { items: [], total: 0 } });
    }
  }, [userId]);

  // Load cart from database
  const loadCart = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      console.log('📥 Cart loaded from database:', response.data);
      console.log('📥 Cart items structure:', response.data.items?.map(item => ({
        _id: item._id,
        product: item.product,
        productType: typeof item.product,
        productId: item.product?._id || item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })));
      
      dispatch({ type: 'SET_CART', payload: response.data });
      console.log('📥 Cart loaded from database:', response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
      // Set empty cart on error
      dispatch({ type: 'SET_CART', payload: { items: [], total: 0 } });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (item) => {
    if (!userId) {
      console.error('No user logged in');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/cart/items', {
        productId: item._id,
        quantity: 1
      });
      
      dispatch({ type: 'ADD_ITEM', payload: response.data });
      console.log('➕ Item added to cart:', response.data);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart by cart item ID (fallback when product ID is not available)
  const removeItemById = async (cartItemId) => {
    if (!userId) return;

    try {
      console.log('🗑️ Attempting to remove cart item by ID:', cartItemId);
      console.log('🗑️ Current cart state before removal:', state);
      
      setLoading(true);
      const response = await api.delete(`/api/cart/item/${cartItemId}`);
      
      console.log('🗑️ Backend response:', response.data);
      
      dispatch({ type: 'REMOVE_ITEM', payload: response.data });
      console.log('➖ Item removed from cart by ID:', response.data);
    } catch (error) {
      console.error('❌ Error removing cart item by ID:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    if (!userId) return;

    try {
      console.log('🗑️ Attempting to remove item with productId:', productId);
      console.log('🗑️ Current cart state before removal:', state);
      
      setLoading(true);
      const response = await api.delete(`/api/cart/items/${productId}`);
      
      console.log('🗑️ Backend response:', response.data);
      
      dispatch({ type: 'REMOVE_ITEM', payload: response.data });
      console.log('➖ Item removed from cart:', response.data);
    } catch (error) {
      console.error('❌ Error removing item from cart:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (!userId || quantity < 1) return;

    try {
      setLoading(true);
      const response = await api.put(`/api/cart/items/${productId}`, {
        quantity
      });
      dispatch({ type: 'UPDATE_QUANTITY', payload: response.data });
      console.log('🔄 Quantity updated:', response.data);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await api.delete('/api/cart');
      dispatch({ type: 'CLEAR_CART', payload: response.data });
      console.log('🗑️ Cart cleared:', response.data);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buy now (direct purchase without affecting cart)
  const buyNow = async (item) => {
    if (!userId) {
      console.error('No user logged in');
      return;
    }

    try {
      setLoading(true);
      // Create a temporary cart item for direct purchase
      const tempCartItem = {
        product: item._id,
        productId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      };
      
      // Set temporary cart for direct purchase
      dispatch({ type: 'BUY_NOW', payload: { items: [tempCartItem], total: item.price } });
      console.log('🛒 Buy now direct purchase set:', tempCartItem);
    } catch (error) {
      console.error('Error setting buy now purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items: state.items,
    total: state.total,
    loading,
    addItem,
    removeItem,
    removeItemById,
    updateQuantity,
    clearCart,
    buyNow,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
