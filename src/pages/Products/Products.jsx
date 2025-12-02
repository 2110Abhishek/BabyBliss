// src/pages/Products/Products.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// removed unused 'motion' to satisfy eslint no-unused-vars
import ProductCard from '../../components/ProductCard/ProductCard';
import { allProducts, categories as allCategories } from '../../data/allProducts';
import { FiFilter, FiGrid, FiList, FiChevronDown, FiStar, FiTrendingUp, FiClock, FiX } from 'react-icons/fi';
import './Products.css';
import { convertAdjustAndFormat } from '../../utils/currency';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters
  const getCategoryFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('category') || 'all';
  };

  // Initialize state from URL
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromURL());
  const [priceRange, setPriceRange] = useState([0, 200]); // USD-based filter values
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keep categories stable between renders
  const categories = useMemo(() => {
    return allCategories.map(cat => ({
      ...cat,
      count:
        cat.id === 'all'
          ? allProducts.length
          : allProducts.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length
    }));
  }, []);

  // Update selectedCategory when the URL changes (so back/forward browser works)
  useEffect(() => {
    const cat = getCategoryFromURL();
    if (cat !== selectedCategory) setSelectedCategory(cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const computeFilteredProducts = useCallback(() => {
    let filtered = [...allProducts];

    if (selectedCategory && selectedCategory !== 'all') {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name;
      if (categoryName) {
        filtered = filtered.filter(product =>
          product.category.toLowerCase() === categoryName.toLowerCase()
        );
      }
    }

    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    return filtered;
  }, [selectedCategory, priceRange, sortBy, categories]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = computeFilteredProducts();
      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [computeFilteredProducts]);

  const handleCategorySelect = (categoryId) => {
    if (categoryId === 'all') {
      navigate('/products', { replace: true });
    } else {
      navigate(`/products?category=${categoryId}`, { replace: true });
    }
    setSelectedCategory(categoryId);
    setShowFilters(false);
  };

  const handlePriceChange = (min, max) => {
    setPriceRange([min, max]);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 200]);
    setSortBy('featured');
    navigate('/products', { replace: true });
    setShowFilters(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>
            {selectedCategory === 'all'
              ? 'All Baby Products'
              : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
          </h1>
          <p>Found {filteredProducts.length} products for your little one</p>
        </div>

        <div className="products-layout">
          <aside className={`products-filters ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
              <h3>
                <FiFilter />
                Filters
              </h3>
              <button className="close-filters" onClick={() => setShowFilters(false)} aria-label="Close filters">
                <FiX />
              </button>
            </div>

            {(selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 200) && (
              <div className="active-filters">
                <div className="active-filters-header">
                  <span>Active Filters:</span>
                  <button onClick={clearFilters} className="clear-all-btn">Clear All</button>
                </div>
                <div className="filter-tags">
                  {selectedCategory !== 'all' && (
                    <span className="filter-tag">
                      Category: {categories.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => handleCategorySelect('all')}>×</button>
                    </span>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 200) && (
                    <span className="filter-tag">
                      Price: {convertAdjustAndFormat(priceRange[0])} - {convertAdjustAndFormat(priceRange[1])}
                      <button onClick={() => setPriceRange([0, 200])}>×</button>
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="filter-section">
              <h4>Categories</h4>
              <div className="category-list">
                {categories.map(category => (
                  <button key={category.id} className={`category-item ${selectedCategory === category.id ? 'active' : ''}`} onClick={() => handleCategorySelect(category.id)}>
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-filter">
                <div className="price-inputs">
                  <input type="number" min="0" max="200" value={priceRange[0]} onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0, priceRange[1])} className="price-input" placeholder="Min" />
                  <span>to</span>
                  <input type="number" min="0" max="200" value={priceRange[1]} onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value) || 200)} className="price-input" placeholder="Max" />
                </div>
                <div className="slider-container">
                  <input type="range" min="0" max="200" step="5" value={priceRange[0]} onChange={(e) => handlePriceChange(parseInt(e.target.value), priceRange[1])} className="price-slider" />
                  <input type="range" min="0" max="200" step="5" value={priceRange[1]} onChange={(e) => handlePriceChange(priceRange[0], parseInt(e.target.value))} className="price-slider" />
                </div>
                <div className="price-display">
                  <span>{convertAdjustAndFormat(priceRange[0])}</span>
                  <span>{convertAdjustAndFormat(priceRange[1])}</span>
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4>Sort By</h4>
              <div className="sort-options">
                <button className={`sort-option ${sortBy === 'featured' ? 'active' : ''}`} onClick={() => setSortBy('featured')}><FiStar />Featured</button>
                <button className={`sort-option ${sortBy === 'price-low' ? 'active' : ''}`} onClick={() => setSortBy('price-low')}>Price: Low to High</button>
                <button className={`sort-option ${sortBy === 'price-high' ? 'active' : ''}`} onClick={() => setSortBy('price-high')}>Price: High to Low</button>
                <button className={`sort-option ${sortBy === 'rating' ? 'active' : ''}`} onClick={() => setSortBy('rating')}><FiTrendingUp />Top Rated</button>
                <button className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => setSortBy('newest')}><FiClock />Newest</button>
              </div>
            </div>
          </aside>

          <main className="products-main">
            <div className="products-header">
              <div className="products-info">
                <h2>
                  {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
                  <span className="product-count"> ({filteredProducts.length} products)</span>
                </h2>
                <button className="mobile-filter-btn" onClick={() => setShowFilters(!showFilters)}><FiFilter />Filters</button>
              </div>

              <div className="products-controls">
                <div className="view-toggle">
                  <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
                  <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
                </div>

                <div className="sort-select">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-dropdown">
                    <option value="featured">Sort by: Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                  <FiChevronDown className="dropdown-icon" />
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <div className="no-products-content">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or browse all products</p>
                  <button className="btn btn-primary" onClick={clearFilters}>View All Products</button>
                </div>
              </div>
            ) : (
              <>
                <div className={`products-container ${viewMode}`}>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="pagination">
                  <button className="pagination-btn disabled">← Previous</button>
                  <div className="page-numbers">
                    <button className="page-number active">1</button>
                    <button className="page-number">2</button>
                    <button className="page-number">3</button>
                    <span className="page-dots">...</span>
                    <button className="page-number">10</button>
                  </div>
                  <button className="pagination-btn">Next →</button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
