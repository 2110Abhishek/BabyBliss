import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiTruck, FiShield, FiRefreshCw, FiGift } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import NotificationButton from '../../components/Notification/NotificationButton';
import { allProducts, categories as allCategories } from '../../data/allProducts';
import { convertAdjustAndFormat } from '../../utils/currency';

// Image imports — make sure these files exist in src/assets/
import WelcomeBliss from '../../assets/Welcome-Bliss.png';
import SummerBaby from '../../assets/summer-baby.png';
import NewTech from '../../assets/New-Tech.png';

import './Home.css';

// Helper function for category colors
function getCategoryColor(categoryId) {
  const colors = {
    clothing: '#fce7f3',
    toys: '#e0f2fe',
    feeding: '#fef3c7',
    bath: '#d1fae5',
    nursery: '#ede9fe',
    safety: '#f3e8ff',
    travel: '#ffedd5',
    new: '#dcfce7'
  };
  return colors[categoryId] || '#e0f2fe';
}

// Get the first 8 featured products
const featuredProducts = allProducts
  .filter(product => product.tags?.includes('Best Seller') || product.rating >= 4.5)
  .slice(0, 8);

// Get first 6 categories for home page (excluding 'all' category)
const categories = allCategories
  .filter(cat => cat.id !== 'all')
  .slice(0, 6)
  .map(cat => ({
    ...cat,
    color: getCategoryColor(cat.id)
  }));

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // slides defined inside component so length is stable for effect
  const slides = [
    {
      title: 'Welcome to Baby Bliss',
      subtitle: 'Premium Products for Your Little One',
      description: 'Discover the best selection of baby essentials with free shipping on orders over ₹500',
      image: WelcomeBliss, // imported asset
      buttonText: 'Shop Now',
      color: 'linear-gradient(135deg, #0ea5e9, #3b82f6)'
    },
    {
      title: 'Summer Collection',
      subtitle: 'Up to 50% Off',
      description: 'Lightweight clothing and accessories for sunny days',
      image: SummerBaby,      // imported asset
      buttonText: 'View Deals',
      color: 'linear-gradient(135deg, #f472b6, #f59e0b)',
      small: true             // flag to render this slide's image smaller/card-like
    },
    {
      title: 'New Tech for Parents',
      subtitle: 'Smart Baby Gear',
      description: 'Innovative gadgets to make parenting easier and safer',
      image: NewTech, // imported asset
      buttonText: 'Explore Tech',
      color: 'linear-gradient(135deg, #10b981, #059669)'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${currentSlide === index ? 'active' : ''}`}
            style={{ background: slide.color }}
          >
            <div className="container">
              <div className="hero-content">
                <div className="hero-text">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {slide.title}
                  </motion.h1>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {slide.subtitle}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {slide.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Link to="/products" className="btn btn-primary btn-lg hero-btn">
                      {slide.buttonText}
                      <FiChevronRight />
                    </Link>
                  </motion.div>
                </div>

                {/* hero-image: conditionally apply a small/card style when slide.small is true */}
                <div className={`hero-image ${slide.small ? 'hero-image-small' : ''}`}>
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    src={slide.image}
                    alt={slide.title}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="feature-icon"><FiTruck /></div>
              <h3>Free Shipping</h3>
              <p>On orders over ₹500</p>
            </motion.div>

            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon"><FiShield /></div>
              <h3>Safe & Secure</h3>
              <p>100% secure checkout</p>
            </motion.div>

            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="feature-icon"><FiRefreshCw /></div>
              <h3>Easy Returns</h3>
              <p>7-day return policy</p>
            </motion.div>

            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="feature-icon"><FiGift /></div>
              <h3>Gift Cards</h3>
              <p>Perfect for baby showers</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Notification Demo */}
      <section className="notification-section">
        <div className="container">
          <motion.div
            className="notification-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Stay Updated!</h2>
            <p>Get notified about flash sales, new arrivals, and exclusive offers</p>
            <NotificationButton />
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="category-card"
                style={{ backgroundColor: category.color }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleCategoryClick(category.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
              >
                <div className="category-image-wrapper">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="category-image" />
                  ) : (
                    <div className="category-icon">{category.icon}</div>
                  )}
                </div>
                <h3>{category.name}</h3>
                <p>{category.count} items</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-secondary">
              View All Categories
              <FiChevronRight style={{ marginLeft: '0.5rem' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all">
              View All
              <FiChevronRight />
            </Link>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="container">
          <h2 className="section-title">Why Choose BabyBliss?</h2>
          <div className="reasons-grid">
            <motion.div className="reason" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="reason-number">01</div>
              <h3>Quality Products</h3>
              <p>All products are tested for safety and made with baby-friendly materials.</p>
            </motion.div>

            <motion.div className="reason" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="reason-number">02</div>
              <h3>Expert Curation</h3>
              <p>Our team of parents and experts carefully select every product in our store.</p>
            </motion.div>

            <motion.div className="reason" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="reason-number">03</div>
              <h3>Parent Community</h3>
              <p>Join thousands of parents who trust BabyBliss for their baby's needs.</p>
            </motion.div>

            <motion.div className="reason" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="reason-number">04</div>
              <h3>Sustainable Choices</h3>
              <p>Eco-friendly products and packaging for a better future.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <motion.div className="newsletter-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2>Join Our Parent Community</h2>
            <p>Get parenting tips, product recommendations, and exclusive offers</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email address" className="newsletter-input" />
              <button className="btn btn-primary newsletter-btn">Subscribe</button>
            </div>
            <p className="newsletter-note">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
