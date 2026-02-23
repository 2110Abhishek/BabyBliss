import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './redux/store';

import { AuthProvider, useAuth } from './context/Authcontext';
import { auth } from './firebase/firebase';
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import NotificationPopup from './components/Notification/NotificationPopup';
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/Chatbot/Chatbot';

// Pages
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import CartPage from './pages/CartPage/CartPage';
import Checkout from './pages/Checkout/Checkout';
import Payment from './pages/Payment/Payment';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';

import OrderHistory from './pages/Orders/OrderHistory';
import OrderTracking from './pages/Orders/OrderTracking'; // New Import
import Login from './pages/Login/Login';
import SellerPage from './pages/Seller/SellerPage'; // New Import
import SellerRegistration from './pages/Seller/SellerRegistration'; // New Import
import BlockedPage from './pages/Blocked/BlockedPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import WishlistPage from './pages/Wishlist/WishlistPage';
import Profile from './pages/Profile/Profile'; // New Import

// Legal Pages
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import TermsOfService from './pages/Legal/TermsOfService';
import ShippingPolicy from './pages/Legal/ShippingPolicy';
import ReturnsPolicy from './pages/Legal/ReturnsPolicy';


// Styles
import './styles/globals.css';
import './styles/animations.css';
import './App.css';

const ProductsWithKey = () => {
  const location = useLocation();
  return <Products key={location.search} />;
};



const App = () => {
  return (
    <AuthProvider>
      <Provider store={store}>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </Provider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.toLowerCase().replace(/\/$/, '') === '/login';
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user is blocked on every route change
  React.useEffect(() => {
    const checkUserStatus = async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
        } catch (error) {
          if (error.code === 'auth/user-disabled') {
            await logout();
            navigate('/blocked');
          }
        }
      }
    };
    checkUserStatus();
  }, [location.pathname, logout, navigate]);

  return (
    <>
      {!isLoginPage && <Header />}

      <main className={`main-content ${isLoginPage ? 'login-layout' : ''}`} style={{ minHeight: '60vh' }}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/login" element={<Login />} />
          <Route path="/blocked" element={<BlockedPage />} />

          {/* PROTECTED */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsWithKey />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id/track"
            element={
              <ProtectedRoute>
                <OrderTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell"
            element={<SellerPage />}
          />
          <Route
            path="/sell/register"
            element={
              <ProtectedRoute>
                <SellerRegistration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-seller"
            element={
              <ProtectedRoute>
                <SellerRegistration />
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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Legal Routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsPolicy />} />

        </Routes>
      </main>

      {!isLoginPage && <Footer />}
      {!isLoginPage && <NotificationPopup />}
      {!isLoginPage && <Chatbot />}
      <Toaster
        position="top-right"
        containerStyle={{
          top: '90px', // Below header
        }}
        toastOptions={{
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff'
          }
        }}
      />
    </>
  );
};

export default App;
