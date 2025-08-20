import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import MyProductsPage from './pages/MyProductsPage';
import EditProductPage from './pages/EditProductPage';
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper component to provide cart context with user ID
function CartWrapper({ children }) {
  const { user } = useAuth();
  
  return (
    <CartProvider userId={user?._id}>
      {children}
    </CartProvider>
  );
}

// Separate component to access auth context
function AppContent() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderConfirmationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/myproducts" 
              element={
                <ProtectedRoute>
                  <MyProductsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit/:id" 
              element={
                <ProtectedRoute>
                  <EditProductPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartWrapper>
        <AppContent />
      </CartWrapper>
    </AuthProvider>
  );
}

export default App;
