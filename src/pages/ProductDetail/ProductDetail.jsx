// src/pages/ProductDetail/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiChevronLeft, FiHeart, FiShoppingCart, FiCornerUpLeft, FiChevronsLeft } from 'react-icons/fi';
import { addToCart } from '../../redux/cartSlice';
import { useAuth } from '../../context/Authcontext';
import api from '../../api/api'; // ✅ ADD THIS (API client)
import { convertAdjustAndFormat } from '../../utils/currency';
import toast from 'react-hot-toast';
import ReviewForm from '../../components/ReviewForm';
import Pagination from '../../components/Pagination';
import Recommendations from '../../components/Recommendations/Recommendations';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, toggleWishlist, isInWishlist } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(''); // State for slider

  // ✅ FETCH PRODUCT FROM BACKEND
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        // Set initial active image (prefer legacy 'image' or first of 'images')
        setActiveImage(res.data.image || (res.data.images && res.data.images[0]) || '');
      } catch (err) {
        console.error('Failed to fetch product', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [refreshReviews, setRefreshReviews] = useState(false);

  // Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${id}`, { params: { page: reviewsPage } });
        if (res.data.reviews) {
          setReviews(res.data.reviews);
          setReviewsTotalPages(res.data.totalPages);
        } else {
          setReviews(res.data); // Fallback
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    };
    fetchReviews();
  }, [id, refreshReviews, reviewsPage]);

  // Variant States
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);

  // Quantity State (Re-added)
  const [quantity, setQuantity] = useState(1);

  // Current Variant State
  const [currentVariant, setCurrentVariant] = useState(null);

  // Auto-select first option if available (Optional, improves UX)
  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0 && !selectedSize) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0 && !selectedColor) setSelectedColor(product.colors[0]);
      if (product.ageGroups?.length > 0 && !selectedAge) setSelectedAge(product.ageGroups[0]);
      if (product.packQuantities?.length > 0 && !selectedPack) setSelectedPack(product.packQuantities[0]);
    }
  }, [product]);

  // Determine Current Variant & Stock
  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      setCurrentVariant(null);
      return;
    }

    const variant = product.variants.find(v =>
      (!product.sizes.length || v.size === selectedSize) &&
      (!product.colors.length || v.color === selectedColor) &&
      (!product.ageGroups.length || v.ageGroup === selectedAge) &&
      (!product.packQuantities.length || v.packQuantity === selectedPack)
    );

    setCurrentVariant(variant || null);
  }, [product, selectedSize, selectedColor, selectedAge, selectedPack]);

  // Helper to check availability
  const isOptionAvailable = (type, value) => {
    if (!product.variants || product.variants.length === 0) return true;

    return product.variants.some(v => {
      if (v[type] !== value) return false;
      if (v.stock <= 0) return false;

      // Check against OTHER selected attributes
      if (type !== 'size' && product.sizes.length && selectedSize && v.size !== selectedSize) return false;
      if (type !== 'color' && product.colors.length && selectedColor && v.color !== selectedColor) return false;
      if (type !== 'ageGroup' && product.ageGroups.length && selectedAge && v.ageGroup !== selectedAge) return false;
      if (type !== 'packQuantity' && product.packQuantities.length && selectedPack && v.packQuantity !== selectedPack) return false;

      return true;
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate Selections
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    if (product.colors?.length > 0 && ['clothing', 'boys', 'girls'].includes(product.category?.toLowerCase() || '') && !selectedColor) return toast.error('Please select a color');
    if (product.ageGroups?.length > 0 && !selectedAge) return toast.error('Please select an age group');
    if (product.packQuantities?.length > 0 && !selectedPack) return toast.error('Please select a pack quantity');

    dispatch(
      addToCart({
        ...product,
        selectedSize,
        selectedColor,
        selectedAge,
        selectedPack,
        quantity: parseInt(quantity)
      })
    );

    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;

    // Validate Selections
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
    if (product.colors?.length > 0 && ['clothing', 'boys', 'girls'].includes(product.category?.toLowerCase() || '') && !selectedColor) return toast.error('Please select a color');
    if (product.ageGroups?.length > 0 && !selectedAge) return toast.error('Please select an age group');
    if (product.packQuantities?.length > 0 && !selectedPack) return toast.error('Please select a pack quantity');

    dispatch(addToCart({
      ...product,
      selectedSize,
      selectedColor,
      selectedAge,
      selectedPack,
      quantity: parseInt(quantity)
    }));
    navigate('/checkout');
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    const action = await toggleWishlist(product);
    if (action === 'added') toast.success('Added to wishlist!');
    else if (action === 'removed') toast.success('Removed from wishlist');
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.95)',
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#333'
        }}
      >
        <p>Loading product...</p>
      </div>
    );
  }

  // ❌ Product not found
  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiCornerUpLeft /> Back
          </button>

          <div className="product-not-found">
            <h2>Product not found</h2>
            <p>The product you are looking for does not exist.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FiChevronLeft /> Back
        </button>

        <div className="product-detail">
          <div className="product-gallery-wrapper">
            <div className="product-image">
              <img src={activeImage || product.image} alt={product.name} style={{ objectFit: 'contain' }} />
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="product-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '8px',
                      border: activeImage === img ? '2px solid #3b82f6' : '1px solid #ddd',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      opacity: activeImage === img ? 1 : 0.6,
                      transition: 'all 0.2s',
                      padding: '2px', // gap between border and image
                      background: 'white'
                    }}
                  >
                    <img src={img} alt={`View ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>

            <p className="product-price">
              {convertAdjustAndFormat(product.price, product.category)}
            </p>

            {product.discount && product.originalPrice && (
              <p className="product-discount">
                <span className="original">
                  {convertAdjustAndFormat(
                    product.originalPrice,
                    product.category
                  )}
                </span>
                <span className="off" style={{ marginLeft: '10px' }}> {product.discount}% off</span>
              </p>
            )}

            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <span>⭐ {product.rating || '—'}</span>
              <span>({reviews.length} reviews)</span>
              <span>Category: {product.category}</span>
            </div>

            <div className="product-actions" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              {/* Variants Section */}
              <div className="product-variants" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {product.sizes?.length > 0 && (
                  <div className="variant-group">
                    <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Size:</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.sizes.map(size => {
                        const available = isOptionAvailable('size', size);
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            disabled={!available}
                            style={{
                              padding: '8px 15px',
                              border: selectedSize === size ? '2px solid #333' : '1px solid #ddd',
                              background: selectedSize === size ? '#f5f5f5' : (available ? 'white' : '#f9f9f9'),
                              color: available ? 'black' : '#ccc',
                              borderRadius: '4px',
                              cursor: available ? 'pointer' : 'not-allowed',
                              fontWeight: selectedSize === size ? 'bold' : 'normal',
                              textDecoration: available ? 'none' : 'line-through'
                            }}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {product.colors?.length > 0 && ['clothing', 'boys', 'girls'].includes(product.category?.toLowerCase() || '') && (
                  <div className="variant-group">
                    <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Color:</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.colors.map(color => {
                        const available = isOptionAvailable('color', color);
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            disabled={!available}
                            style={{
                              padding: '8px 15px',
                              border: selectedColor === color ? '2px solid #333' : '1px solid #ddd',
                              background: selectedColor === color ? '#f5f5f5' : (available ? 'white' : '#f9f9f9'),
                              color: available ? 'black' : '#ccc',
                              borderRadius: '4px',
                              cursor: available ? 'pointer' : 'not-allowed',
                              fontWeight: selectedColor === color ? 'bold' : 'normal',
                              textDecoration: available ? 'none' : 'line-through'
                            }}
                          >
                            {color}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {product.ageGroups?.length > 0 && (
                  <div className="variant-group">
                    <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Age Group:</label>
                    <select
                      value={selectedAge || ''}
                      onChange={(e) => setSelectedAge(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                    >
                      <option value="" disabled>Select Age Group</option>
                      {product.ageGroups.map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                )}

                {product.packQuantities?.length > 0 && (
                  <div className="variant-group">
                    <label style={{ fontWeight: '500', marginBottom: '5px', display: 'block' }}>Pack Quantity:</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {product.packQuantities.map(pack => {
                        const available = isOptionAvailable('packQuantity', pack);
                        return (
                          <button
                            key={pack}
                            onClick={() => setSelectedPack(pack)}
                            disabled={!available}
                            style={{
                              padding: '8px 15px',
                              border: selectedPack === pack ? '2px solid #333' : '1px solid #ddd',
                              background: selectedPack === pack ? '#f5f5f5' : (available ? 'white' : '#f9f9f9'),
                              color: available ? 'black' : '#ccc',
                              borderRadius: '4px',
                              cursor: available ? 'pointer' : 'not-allowed',
                              fontWeight: selectedPack === pack ? 'bold' : 'normal',
                              textDecoration: available ? 'none' : 'line-through'
                            }}
                          >
                            {pack}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Status & Quantity */}
              <div style={{ marginBottom: '15px', marginTop: '10px' }}>
                {/* Logic: If variants exist, depend on currentVariant.stock. Else global product.stock */}

                {(currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <label style={{ fontWeight: '500' }}>Quantity:</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        {[...Array(Math.min(10, (currentVariant ? currentVariant.stock : product.stock))).keys()].map(x => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                    </div>
                    {(currentVariant ? currentVariant.stock : product.stock) < 5 && (
                      <p style={{ color: '#ea580c', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        🔥 Hurry! Only {currentVariant ? currentVariant.stock : product.stock} left in stock!
                      </p>
                    )}
                  </>
                ) : (
                  <p style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    ❌ Out of Stock {currentVariant && '(Selected Option)'}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn"
                  onClick={handleAddToCart}
                  disabled={!(currentVariant ? currentVariant.stock > 0 : product.stock > 0)}
                  style={{
                    background: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? '#ffd814' : '#e5e7eb',
                    color: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? '#000' : '#9ca3af',
                    border: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? '1px solid #fcd200' : '1px solid #d1d5db',
                    flex: 1,
                    justifyContent: 'center',
                    cursor: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add to Cart
                </button>

                <button
                  className="btn"
                  onClick={handleBuyNow}
                  disabled={!(currentVariant ? currentVariant.stock > 0 : product.stock > 0)}
                  style={{
                    background: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? '#ffa41c' : '#e5e7eb',
                    color: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? '#000' : '#9ca3af',
                    border: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? '1px solid #ff8f00' : '1px solid #d1d5db',
                    flex: 1,
                    justifyContent: 'center',
                    cursor: (currentVariant ? currentVariant.stock > 0 : product.stock > 0) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Buy Now
                </button>
              </div>

              <button
                className="btn"
                onClick={handleWishlist}
                style={{
                  background: 'white',
                  color: isInWishlist(product._id) ? '#e11d48' : '#333',
                  border: '1px solid #ddd',
                  marginTop: '0px',
                  justifyContent: 'center',
                  gap: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <FiHeart fill={isInWishlist(product._id) ? "#e11d48" : "none"} />
                {isInWishlist(product._id) ? 'Added to Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="product-reviews-section" style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
          <h2>Customer Reviews</h2>

          <div className="reviews-list" style={{ marginTop: '20px' }}>
            {reviews.length === 0 ? <p>No reviews yet.</p> : (
              reviews.map(review => (
                <div key={review._id} className="review-item" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#fcd200' : '#e5e7eb' }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontWeight: '600' }}>{review.userName}</span>
                    {review.isVerifiedPurchase && (
                      <span style={{ fontSize: '0.8rem', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>✅ Verified Purchase</span>
                    )}
                  </div>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                  <p style={{ marginTop: '10px' }}>{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Review" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            <Pagination
              currentPage={reviewsPage}
              totalPages={reviewsTotalPages}
              onPageChange={setReviewsPage}
            />
          </div>

          <ReviewForm productId={product.id} user={user} onReviewAdded={() => setRefreshReviews(prev => !prev)} />
        </div>
      </div>

      {/* AI Recommendations */}
      <Recommendations currentProductId={product._id || product.id} title="Similar Products" subtitle="Keep exploring products you might love" />
    </div>
  );
};

export default ProductDetail;
