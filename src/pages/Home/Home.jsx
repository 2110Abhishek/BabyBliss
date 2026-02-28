import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiTruck, FiShield, FiRefreshCw, FiGift } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';

import { allProducts, categories as allCategories } from '../../data/allProducts';
import { convertAdjustAndFormat } from '../../utils/currency';

import api from '../../api/api';
import toast from 'react-hot-toast';

import './Home.css';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const res = await api.post('/subscribers', { email });
      toast.success(res.data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubscribe} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <input
        type="email"
        placeholder="Your email address"
        className="newsletter-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <button
        type="submit"
        className="btn btn-primary newsletter-btn"
        disabled={loading}
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
};

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

// Get first 6 categories for home page (excluding 'all' category)
// logic moved to inside component to support dynamic counts

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // slides defined inside component so length is stable for effect
  const slides = [
    {
      title: 'Welcome to Bliss Bloomly',
      subtitle: 'Premium Products for Your Little One',
      description: 'Discover the best selection of baby essentials with free shipping on orders over ₹500',
      image: '/assets/images/Welcome-Bliss.png', // Using public asset for preloading
      buttonText: 'Shop Now',
      color: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
      link: '/products',
      priority: true // Mark for LCP optimization
    },
    {
      title: 'Summer Collection',
      subtitle: 'Up to 20% Off',
      description: 'Lightweight clothing and accessories for sunny days',
      image: '/assets/images/summer-baby.png',      // Using public asset
      buttonText: 'View Deals',
      color: 'linear-gradient(135deg, #f472b6, #f59e0b)',
      extraClass: 'hero-image-offset',
      link: '/products?category=clothing'
    },
    {
      title: 'New Tech for Parents',
      subtitle: 'Smart Baby Gear',
      description: 'Innovative gadgets to make parenting easier and safer',
      image: '/assets/images/New-Tech.png', // Using public asset
      buttonText: 'Explore Tech',
      color: 'linear-gradient(135deg, #10b981, #059669)',
      extraClass: 'hero-image-offset',
      link: '/products?category=Tech'
    }
  ];

  const [homeCategories, setHomeCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Initialize with static data
    const homeCategoryIds = ['clothing', 'toys', 'feeding', 'bath', 'nursery', 'tech'];
    const initialCategories = allCategories
      .filter(cat => homeCategoryIds.includes(cat.id))
      .sort((a, b) => homeCategoryIds.indexOf(a.id) - homeCategoryIds.indexOf(b.id))
      .map(cat => ({
        ...cat,
        color: getCategoryColor(cat.id)
      }));
    setHomeCategories(initialCategories);

    // Fetch actual counts from backend
    const fetchCounts = async () => {
      try {
        const res = await api.get('/products?limit=1');
        if (res.data && res.data.categoryCounts) {
          setHomeCategories(prevCats => prevCats.map(cat => ({
            ...cat,
            count: res.data.categoryCounts[cat.id] || cat.count
          })));
        }
      } catch (err) {
        console.error("Failed to fetch category counts", err);
      }
    };
    fetchCounts();

    // Fetch Featured Products
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?featured=true&limit=8');
        if (res.data && res.data.products) {
          setFeaturedProducts(res.data.products);
        }
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
    };
    fetchFeatured();
  }, []);

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
            className={`hero-slide ${currentSlide === index ? 'active' : ''} ${slide.extraClass || ''}`}
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
                    <Link to={slide.link || '/products'} className="btn btn-primary btn-lg hero-btn">
                      {slide.buttonText}
                      <FiChevronRight />
                    </Link>
                  </motion.div>
                </div>

                {/* hero-image: conditionally apply a small/card style when slide.small is true */}
                <div className={`hero-image ${slide.small ? 'hero-image-small' : ''} ${slide.extraClass || ''}`}>
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    src={slide.image}
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    {...(index === 0 ? { fetchPriority: "high" } : {})}
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
        </div>      </section>

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



      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {homeCategories.map((category, index) => (
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
          <h2 className="section-title">Why Choose BlissBloomly?</h2>
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
              <p>Join thousands of parents who trust BlissBloomly for their baby's needs.</p>
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
            <NewsletterForm />
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