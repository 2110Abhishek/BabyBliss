import React, { Suspense, lazy } from 'react';
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
import FullScreenLoader from './components/Loader/FullScreenLoader';

// Pages
const Home = lazy(() => import('./pages/Home/Home'));
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const Payment = lazy(() => import('./pages/Payment/Payment'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess/OrderSuccess'));

const OrderHistory = lazy(() => import('./pages/Orders/OrderHistory'));
const OrderTracking = lazy(() => import('./pages/Orders/OrderTracking'));
const Login = lazy(() => import('./pages/Login/Login'));
const SellerPage = lazy(() => import('./pages/Seller/SellerPage'));
const SellerRegistration = lazy(() => import('./pages/Seller/SellerRegistration'));
const BlockedPage = lazy(() => import('./pages/Blocked/BlockedPage'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const WishlistPage = lazy(() => import('./pages/Wishlist/WishlistPage'));
const Profile = lazy(() => import('./pages/Profile/Profile'));

// Legal Pages
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/Legal/TermsOfService'));
const ShippingPolicy = lazy(() => import('./pages/Legal/ShippingPolicy'));
const ReturnsPolicy = lazy(() => import('./pages/Legal/ReturnsPolicy'));


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
        <Suspense fallback={<FullScreenLoader />}>
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
        </Suspense>
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
