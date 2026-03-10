import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import ConsumerDashboard from './components/ConsumerDashboard';
import ProductsPage from './components/ProductsPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import Wishlist from './components/Wishlist';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import OrdersPage from './components/OrdersPage';
import NotificationsPage from './components/NotificationsPage';
import SpecialOrderList from './pages/SpecialOrderList';
import SpecialOrderFarmer from './pages/SpecialOrderFarmer';
import FarmersPage from './components/FarmersPage';
import AddressSelectionPage from './components/AddressSelectionPage';

import PaymentPage from './components/PaymentPage';
import LoginPage from './components/LoginPage';
import FarmerLoginPage from './components/FarmerLoginPage';
import SettingsPage from './components/SettingsPage';
import RegistrationPage from './components/RegistrationPage';
import FarmerRegistrationPage from './components/FarmerRegistrationPage';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginPage from './components/AdminLoginPage';
import FarmerDashboard from './components/FarmerDashboard';
import ProfilePage from './components/ProfilePage';
import HelpPage from './components/HelpPage';
import AccountPage from './components/AccountPage';
import AboutUs from './components/AboutUs';
import TestAuth from './components/TestAuth';
import ContactUs from './components/ContactUs';


function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const AppContent = ({ wishlistItems, cartItems, searchTerm, handleSearchChange, setCartItems, clearCart }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const isFarmerDashboard = location.pathname === '/farmer/dashboard';
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
      <>
        {!isFarmerDashboard && !isAdminPage && (
          <Navbar
            wishlistItems={wishlistItems}
            propCartItems={cartItems}
            propUserProfile={user}
            onLogout={logout}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <ConsumerDashboard
                  searchTerm={searchTerm}
                  setCartItems={setCartItems}
                  userProfile={user}
                  cartItems={cartItems}
                  onSearchChange={handleSearchChange}
                  clearCart={clearCart}
                />
              }
            />
            <Route
              path="/consumer/dashboard"
              element={
                <ConsumerDashboard
                  searchTerm={searchTerm}
                  setCartItems={setCartItems}
                  userProfile={user}
                  cartItems={cartItems}
                  onSearchChange={handleSearchChange}
                  clearCart={clearCart}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  searchTerm={searchTerm}
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetailsPage
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                />
              }
            />
            <Route
              path="/wishlist"
              element={
                <Wishlist
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  userProfile={user}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cartItems}
                  setCartItems={setCartItems}
                  wishlistItems={wishlistItems}
                  userProfile={user}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  onLogout={logout}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  userProfile={user}
                  onBackToCart={() => window.history.back()}
                  onPlaceOrder={() => alert('Order placed successfully!')}
                  clearCart={clearCart}
                  wishlistItems={wishlistItems}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  onLogout={logout}
                />
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <OrderConfirmation
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  userProfile={user}
                  wishlistItems={wishlistItems}
                  onLogout={logout}
                />
              }
            />
            <Route path="/orders" element={<OrdersPage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={handleSearchChange} />} />
            <Route path="/notifications" element={<NotificationsPage cartItems={cartItems} setCartItems={setCartItems} userProfile={user} wishlistItems={wishlistItems} searchTerm={searchTerm} onSearchChange={handleSearchChange} />} />
            <Route
              path="/special-order"
              element={
                <SpecialOrderList
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  userProfile={user}
                  wishlistItems={wishlistItems}
                  onLogout={logout}
                />
              }
            />
            <Route
              path="/special-order/:farmerId"
              element={
                <SpecialOrderFarmer
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  userProfile={user}
                  wishlistItems={wishlistItems}
                  onLogout={logout}
                />
              }
            />
            <Route path="/address-selection" element={<AddressSelectionPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/farmer/register" element={<FarmerRegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/farmer/login" element={<FarmerLoginPage />} />
            <Route path="/super-secret-admin" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard onLogout={logout} />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard onLogout={logout} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/account" element={
              <AccountPage
                cartItems={cartItems}
                setCartItems={setCartItems}
                userProfile={user}
                wishlistItems={wishlistItems}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onLogout={logout}
              />
            } />
            <Route path="/about-us" element={
              <AboutUs
                wishlistItems={wishlistItems}
                cartItems={cartItems}
                userProfile={user}
                onLogout={logout}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            } />
            <Route
              path="/farmers"
              element={
                <FarmersPage
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  userProfile={{ name: 'User' }}
                  wishlistItems={[]}
                  onLogout={() => console.log('Logged out')}
                  cartItems={[]}
                  setCartItems={() => {}}
                />
              }
            />
            <Route path="/contact" element={
              <ContactUs
                wishlistItems={wishlistItems}
                cartItems={cartItems}
                userProfile={user}
                onLogout={logout}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
            } />
            <Route path="/test-auth" element={<TestAuth />} />
          </Routes>
        </main>
      </>
    );
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent
              wishlistItems={wishlistItems}
              cartItems={cartItems}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              setCartItems={setCartItems}
              clearCart={clearCart}
            />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              enableMultiContainer={false}
              containerId="main-toast-container"
            />
          </Router>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
