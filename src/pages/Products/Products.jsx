// src/pages/Products/Products.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiFilter, FiChevronDown, FiShoppingBag, FiStar } from 'react-icons/fi';
import { FaTshirt, FaBaby, FaGamepad, FaUtensils, FaBath, FaBed, FaShieldAlt, FaCar, FaMobile } from 'react-icons/fa';
import api from '../../api/api';
import { convertAdjustAndFormat } from '../../utils/currency';
import './Products.css';

import Pagination from '../../components/Pagination';

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const activeCategory = params.get('category') || '';
  const activeSort = params.get('sort') || '';
  const searchQuery = params.get('q');
  const minPriceParam = params.get('minPrice') || '';
  const maxPriceParam = params.get('maxPrice') || '';
  const ratingParam = params.get('rating') || '';
  const pageParam = parseInt(params.get('page')) || 1;

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Filter State
  const [priceRange, setPriceRange] = useState({ min: minPriceParam, max: maxPriceParam });
  const [minRating, setMinRating] = useState(ratingParam);

  const [categoryCounts, setCategoryCounts] = useState({ all: 0, boys: 0, girls: 0, clothing: 0, toys: 0, feeding: 0, bath: 0, tech: 0, new: 0, nursery: 0 });

  /* Fetch Data */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const productParams = {
          page: pageParam,
          limit: 12 // Adjust based on design preference
        };
        if (activeCategory && activeCategory !== 'all') productParams.category = activeCategory;
        if (searchQuery) productParams.q = searchQuery;
        if (activeSort) productParams.sort = activeSort;
        if (minPriceParam) productParams.minPrice = minPriceParam;
        if (maxPriceParam) productParams.maxPrice = maxPriceParam;
        if (ratingParam) productParams.rating = ratingParam;

        const res = await api.get('/products', { params: productParams });

        // Handle both old array format (fallback) and new object format
        if (Array.isArray(res.data)) {
          setProducts(res.data);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          setProducts(res.data.products || []);
          setTotalPages(res.data.totalPages || 1);
          setCurrentPage(res.data.currentPage || 1);
          setTotalProducts(res.data.totalProducts || 0);

          if (res.data.categoryCounts) {
            setCategoryCounts(res.data.categoryCounts);
          }
        }

      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    setMobileFiltersOpen(false);
  }, [activeCategory, searchQuery, activeSort, minPriceParam, maxPriceParam, ratingParam, pageParam]);

  /* Handlers */
  const updateParams = (newParams) => {
    const searchParams = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
      else searchParams.delete(key);
    });
    // Reset to page 1 on filter change, unless page explicitly changed
    if (!newParams.page) {
      searchParams.set('page', 1);
    }
    navigate(`${location.pathname}?${searchParams.toString()}`);
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value });
  };

  const handleCategoryClick = (catId) => {
    updateParams({ category: catId === 'all' ? '' : catId });
  };

  const applyFilters = () => {
    updateParams({
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      rating: minRating
    });
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setMinRating('');
    navigate('/products');
  };

  return (
    <div className="products-page">
      <div className="container">

        <div className="products-layout">
          {/* Sidebar */}
          <aside className={`products-filters ${mobileFiltersOpen ? 'show' : ''}`}>
            <div className="filters-header">
              <h3><FiFilter /> Filters</h3>
              <button
                className="close-filters"
                onClick={() => setMobileFiltersOpen(false)}
              >
                &times;
              </button>
            </div>

            {/* Price Filter */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-inputs" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <button
                onClick={applyFilters}
                style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Apply Price
              </button>
            </div>



            <div className="filter-section">
              <h4>Categories</h4>
              <div className="category-list">
                <button className={`category-item ${!activeCategory || activeCategory === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick('all')}><span className="category-icon"><FiShoppingBag /></span><span className="category-name">All Products ({categoryCounts.all})</span></button>
                <button className={`category-item ${activeCategory === 'boys' ? 'active' : ''}`} onClick={() => handleCategoryClick('boys')}><span className="category-icon"><FaBaby /></span><span className="category-name">Boys ({categoryCounts.boys})</span></button>
                <button className={`category-item ${activeCategory === 'girls' ? 'active' : ''}`} onClick={() => handleCategoryClick('girls')}><span className="category-icon"><FaBaby /></span><span className="category-name">Girls ({categoryCounts.girls})</span></button>
                <button className={`category-item ${activeCategory === 'clothing' ? 'active' : ''}`} onClick={() => handleCategoryClick('clothing')}><span className="category-icon"><FaTshirt /></span><span className="category-name">Clothing ({categoryCounts.clothing})</span></button>
                <button className={`category-item ${activeCategory === 'toys' ? 'active' : ''}`} onClick={() => handleCategoryClick('toys')}><span className="category-icon"><FaGamepad /></span><span className="category-name">Toys ({categoryCounts.toys})</span></button>
                <button className={`category-item ${activeCategory === 'feeding' ? 'active' : ''}`} onClick={() => handleCategoryClick('feeding')}><span className="category-icon"><FaUtensils /></span><span className="category-name">Feeding ({categoryCounts.feeding})</span></button>
                <button className={`category-item ${activeCategory === 'bath' ? 'active' : ''}`} onClick={() => handleCategoryClick('bath')}><span className="category-icon"><FaBath /></span><span className="category-name">Bath & Care ({categoryCounts.bath})</span></button>
                <button className={`category-item ${activeCategory === 'nursery' ? 'active' : ''}`} onClick={() => handleCategoryClick('nursery')}><span className="category-icon"><FaBed /></span><span className="category-name">Nursery ({categoryCounts.nursery || 0})</span></button>
                <button className={`category-item ${activeCategory === 'tech' ? 'active' : ''}`} onClick={() => handleCategoryClick('tech')}><span className="category-icon"><FaMobile /></span><span className="category-name">Tech ({categoryCounts.tech})</span></button>
                <button className={`category-item ${activeCategory === 'new' ? 'active' : ''}`} onClick={() => handleCategoryClick('new')}><span className="category-icon"><FiStar /></span><span className="category-name">New Arrivals ({categoryCounts.new})</span></button>
              </div>
            </div>

            <button onClick={clearFilters} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Filters</button>
          </aside>

          {/* Main Content */}
          <main className="products-main">
            {/* Context bar inside main area per design */}
            <div className="products-header">
              <div className="products-info">
                <h2>
                  {(() => {
                    const categoryMap = {
                      'new': 'New Arrivals',
                      'clothing': 'Clothing',
                      'toys': 'Toys',
                      'feeding': 'Feeding',
                      'bath': 'Bath & Care',
                      'nursery': 'Nursery',
                      'safety': 'Safety',
                      'tech': 'Tech',
                      'travel': 'Travel',
                      'boys': 'Boys',
                      'girls': 'Girls'
                    };
                    if (activeCategory === 'all' || !activeCategory) return 'All Products';
                    return categoryMap[activeCategory] || activeCategory;
                  })()}
                  <span className="product-count"> ({totalProducts} products)</span>
                </h2>
              </div>

              <div className="products-controls">
                <button
                  className="mobile-filter-btn"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  Filters
                </button>

                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <FiList />
                  </button>
                </div>

                <div className="sort-select">
                  <select
                    className="sort-dropdown"
                    value={activeSort}
                    onChange={handleSortChange}
                  >
                    <option value="">Sort by: Featured</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="popularity">Popularity</option>
                  </select>
                  <FiChevronDown className="dropdown-icon" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-products">
                <div className="loading-spinner"></div>
                <p>Loading Products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <h3>No Products Found</h3>
                <p>Try adjusting your filters.</p>
                <button
                  className="login-btn"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`products-container ${viewMode}`}>
                {products.map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="product-card"
                  >
                    <div className="product-image-wrapper">
                      {/* Show NEW badge if product is new */}
                      {product.tags && product.tags.includes('New Arrival') && (
                        <span className="badge new">NEW</span>
                      )}
                      <img src={product.image} alt={product.name} loading="lazy" />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      {/* Real Rating */}
                      <div className="product-rating">
                        {'★'.repeat(Math.round(product.rating || 0))}
                        <span style={{ color: '#ccc' }}>{'★'.repeat(5 - Math.round(product.rating || 0))}</span>
                        <span className="review-count">({product.reviews || 0})</span>
                      </div>

                      <div className="product-meta">
                        <span className="price">{convertAdjustAndFormat(product.price)}</span>
                        {viewMode === 'list' && (
                          <div className="list-actions">
                            <span className="tag-stock">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {products.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
