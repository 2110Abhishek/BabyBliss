import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHome, FiHeart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import Cart from '../Cart/Cart';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItems = useSelector(state => state.cart.items);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Shop All', path: '/products' },
    { name: 'Clothing', category: 'clothing', path: '/products?category=clothing' },
    { name: 'Toys', category: 'toys', path: '/products?category=toys' },
    { name: 'Feeding', category: 'feeding', path: '/products?category=feeding' },
    { name: 'Bath & Care', category: 'bath', path: '/products?category=bath' },
    { name: 'New Arrivals', category: 'new', path: '/products?category=new' },
  ];

  
 const handleNavigation = (path, e) => {
  e.preventDefault();
  setIsMenuOpen(false);

  // If we're on the same path+search, do nothing (or optionally scroll to top)
  if (location.pathname + location.search === path) {
    // optional: scroll to top for user feedback
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Normal navigation - this will update location.search and trigger the ProductsWithKey remount if you use key={location.search}
  navigate(path);
};


  return (
    <>
      <motion.header 
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <div className="header__content">
            {/* Logo */}
            <Link to="/" className="header__logo">
              <FiHeart className="header__logo-icon" />
              <div className="header__logo-text">
                <h1>BabyBliss</h1>
                <p>Premium Baby Store</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="header__nav">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="header__nav-link"
                  onClick={(e) => handleNavigation(item.path, e)}
                >
                  {item.icon && <span className="header__nav-icon">{item.icon}</span>}
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="header__actions">
              <button 
                className="header__action-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <FiSearch />
              </button>

              <button 
                className="header__action-btn header__cart-btn"
                onClick={() => setIsCartOpen(true)}
              >
                <FiShoppingCart />
                {cartItems.length > 0 && (
                  <span className="header__cart-count">{cartItems.length}</span>
                )}
              </button>

              <button className="header__action-btn">
                <FiUser />
              </button>

              <button 
                className="header__menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <motion.div 
              className="header__search"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="header__search-container">
                <FiSearch className="header__search-icon" />
                <input
                  type="text"
                  placeholder="Search for diapers, toys, clothes..."
                  className="header__search-input"
                />
              </div>
            </motion.div>
          )}

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              className="header__mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
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
              <button className="btn btn-primary header__mobile-login">
                <FiUser />
                Login / Register
              </button>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Cart Sidebar */}
      <Cart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
};

export default Header;