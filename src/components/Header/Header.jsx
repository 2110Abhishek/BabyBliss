import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiHome,
  FiHeart,
  FiLogOut,
  FiPackage,
  FiBell,
  FiUploadCloud
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import Cart from '../Cart/Cart';
import { clearCart } from '../../redux/cartSlice';
import './Header.css';
import axios from 'axios';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../context/Authcontext';
import NotificationDropdown from '../Notification/NotificationDropdown';



const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Search Suggestions State
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cartItems = useSelector((state) => state.cart.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, wishlist } = useAuth();

  const menuItems = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Shop All', path: '/products' },
    { name: 'Boys', path: '/products?category=boys' },
    { name: 'Girls', path: '/products?category=girls' },
    { name: 'Clothing', path: '/products?category=clothing' },
    { name: 'Toys', path: '/products?category=toys' },
    { name: 'Feeding', path: '/products?category=feeding' },
    { name: 'Bath & Care', path: '/products?category=Bath%20%26%20Care' },
    { name: 'New Arrivals', path: '/products?category=new' },
    { name: 'Sell', path: '/sell', icon: <FiUploadCloud /> }
  ];

  const handleNavigation = (path, e) => {
    if (e) e.preventDefault();
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setShowSuggestions(false);
    setIsCartOpen(false);

    if (location.pathname + location.search === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearCart()); // Clear cart from state and localStorage
      navigate('/login');
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      if (!user && !auth.currentUser) return;
      // Use auth.currentUser logic similar to AdminDashboard if needed, or just uid if public/protected by middleware
      // For now assuming public GET with uid param for simplicity, ideally secured with token
      const uid = user.uid;
      const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/notifications/user/${uid}`);
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`https://blissbloomlybackend.onrender.com/api/notifications/${id}/read`, { uid: user.uid });
      // Update local state
      setNotifications(prev => prev.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleNotificationClick = (n) => {
    // If it's unread, just mark it as read and keep the dropdown open
    if (!n.isRead) {
      markAsRead(n._id);
      return;
    }

    // If it's already read, clicking it will follow the link and close the dropdown
    if (n.data?.url) {
      navigate(n.data.url);
      setShowNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      // Implement backend batch update here if needed
    } catch (err) {
      console.error("Failed to mark all read");
    }
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header__content">
            {/* Logo */}
            <Link to="/" className="header__logo">
              <FiHeart className="header__logo-icon" />
              <div className="header__logo-text">
                <h1>BlissBloomly</h1>
                <p>Premium Baby Store</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="header__nav">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="header__nav-link"
                  onClick={(e) => handleNavigation(item.path, e)}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="header__actions">
              <button className="header__action-btn" onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsCartOpen(false);
              }}>
                <FiSearch />
              </button>

              {/* Notification Bell */}
              {user && (
                <div className="header__notification-container desktop-only-action" style={{ position: 'relative' }} onMouseLeave={() => setShowNotifications(false)}>
                  <button
                    className="header__action-btn"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setIsSearchOpen(false);
                      setShowSuggestions(false);
                      setIsCartOpen(false);
                    }}
                  >
                    <FiBell />
                    {unreadCount > 0 && <span className="header__cart-count" style={{ background: '#ef4444' }}>{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <NotificationDropdown
                      notifications={notifications}
                      onMarkRead={handleNotificationClick}
                      onClose={() => setShowNotifications(false)}
                      onMarkAllRead={markAllAsRead}
                    />
                  )}
                </div>
              )}

              <button
                className="header__action-btn desktop-only-action"
                onClick={() => {
                  navigate('/wishlist');
                  setIsSearchOpen(false);
                  setShowSuggestions(false);
                  setIsCartOpen(false);
                }}
                title="Wishlist"
                style={{ position: 'relative' }}
              >
                <FiHeart />
                {wishlist && wishlist.length > 0 && (
                  <span className="header__cart-count" style={{ background: '#e11d48' }}>
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                className="header__action-btn header__cart-btn"
                onClick={() => {
                  setIsCartOpen(!isCartOpen);
                  setIsSearchOpen(false);
                  setShowSuggestions(false);
                }}
              >
                <FiShoppingCart />
                {cartItems.length > 0 && (
                  <span className="header__cart-count">{cartItems.length}</span>
                )}
              </button>

              <div className="header__profile-menu-container" style={{ position: 'relative' }} onMouseLeave={() => setUserMenuOpen(false)}>
                <button
                  className="header__action-btn"
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setIsSearchOpen(false);
                    setShowSuggestions(false);
                    setIsCartOpen(false);
                  }}
                  title="Account"
                >
                  <FiUser />
                </button>

                {userMenuOpen && (
                  <div className="header__profile-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'white',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    minWidth: '150px',
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}>
                    {user ? (
                      <>
                        <div style={{ padding: '5px 10px', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>
                          {user.email}
                        </div>
                        {user.email === 'blissbloomly@gmail.com' && (
                          <button
                            onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              padding: '8px 10px', border: 'none', background: 'transparent',
                              cursor: 'pointer', color: '#333', width: '100%', textAlign: 'left'
                            }}
                          >
                            <FiUser /> Admin Panel
                          </button>
                        )}
                        <button
                          onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 10px', border: 'none', background: 'transparent',
                            cursor: 'pointer', color: '#333', width: '100%', textAlign: 'left'
                          }}
                        >
                          <FiUser /> My Profile
                        </button>
                        <button
                          onClick={() => { navigate('/orders'); setUserMenuOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 10px', border: 'none', background: 'transparent',
                            cursor: 'pointer', color: '#333', width: '100%', textAlign: 'left'
                          }}
                        >
                          <FiPackage /> My Orders
                        </button>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 10px', border: 'none', background: 'transparent',
                            cursor: 'pointer', color: '#ef4444', width: '100%'
                          }}
                        >
                          <FiLogOut /> Logout
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { navigate('/login'); setUserMenuOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', border: 'none', background: 'transparent',
                          cursor: 'pointer', color: '#3b82f6', width: '100%'
                        }}
                      >
                        <FiUser /> Login
                      </button>
                    )}
                  </div>
                )}
              </div>


              <button
                className="header__menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>

          {/* Search */}
          {isSearchOpen && (
            <div className="header__search">
              <div className="header__search-wrapper">
                <input
                  className="header__search-input"
                  placeholder="Search baby products..."
                  autoFocus
                  value={query}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setQuery(val);
                    if (val.trim().length > 1) {
                      try {
                        const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/products?q=${encodeURIComponent(val)}`);
                        // Ensure we extract the array properly based on the newer backend JSON structure
                        const items = res.data.products || res.data || [];
                        setSuggestions(items.slice(0, 5)); // Limit to 5 suggestions
                        setShowSuggestions(true);
                      } catch (err) {
                        console.error("Failed to fetch suggestions", err);
                      }
                    } else {
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (query.trim()) {
                        navigate(`/products?q=${encodeURIComponent(query.trim())}`);
                        setIsSearchOpen(false);
                        setIsMenuOpen(false);
                        setShowSuggestions(false);
                      }
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                  onFocus={() => query.trim().length > 1 && setShowSuggestions(true)}
                />
                <button
                  className="header__search-submit"
                  onClick={() => {
                    if (query.trim()) {
                      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
                      setIsSearchOpen(false);
                      setIsMenuOpen(false);
                      setShowSuggestions(false);
                    }
                  }}
                >
                  <FiSearch />
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="header__search-suggestions">
                  {suggestions.map((product) => (
                    <div
                      key={product.id || product._id}
                      className="header__suggestion-item"
                      onClick={() => {
                        navigate(`/products/${product.id}`);
                        setIsSearchOpen(false);
                        setIsMenuOpen(false);
                        setShowSuggestions(false);
                        setQuery('');
                      }}
                    >
                      <div className="header__suggestion-image">
                        {/* Placeholder or actual image if available */}
                        <img src={product.image || product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} />
                      </div>
                      <div className="header__suggestion-info">
                        <span className="header__suggestion-name">{product.name}</span>
                        <span className="header__suggestion-price">₹{product.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="header__mobile-menu">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="header__mobile-link"
                  onClick={(e) => handleNavigation(item.path, e)}
                >
                  {item.icon && <span className="header__mobile-icon">{item.icon}</span>}
                  {item.name}
                </a>
              ))}

              <div style={{ height: '1px', background: '#eee', margin: '10px 0' }}></div>

              {user ? (
                <>
                  <div className="header__mobile-user-info" style={{ padding: '0 0 10px', fontSize: '0.9rem', color: '#666' }}>
                    Signed in as <br /> <strong>{user.email}</strong>
                  </div>
                  {user.email === 'blissbloomly@gmail.com' && (
                    <a href="/admin" className="header__mobile-link" onClick={(e) => handleNavigation('/admin', e)}>
                      <span className="header__mobile-icon"><FiUser /></span> Admin Panel
                    </a>
                  )}
                  <a href="/profile" className="header__mobile-link" onClick={(e) => handleNavigation('/profile', e)}>
                    <span className="header__mobile-icon"><FiUser /></span> My Profile
                  </a>
                  <a href="/orders" className="header__mobile-link" onClick={(e) => handleNavigation('/orders', e)}>
                    <span className="header__mobile-icon"><FiPackage /></span> My Orders
                  </a>
                  <button
                    className="header__mobile-link"
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: '#ef4444' }}
                  >
                    <span className="header__mobile-icon"><FiLogOut /></span> Logout
                  </button>
                </>
              ) : (
                <a href="/login" className="header__mobile-link" onClick={(e) => handleNavigation('/login', e)} style={{ color: '#3b82f6' }}>
                  <span className="header__mobile-icon"><FiUser /></span> Login
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
};

export default Header;
