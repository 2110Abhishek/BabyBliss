// src/pages/ProductDetail/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiChevronLeft } from 'react-icons/fi';
import { addToCart } from '../../redux/cartSlice';
import { allProducts } from '../../data/allProducts';
import { convertAdjustAndFormat } from '../../utils/currency';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const found = allProducts.find(p => Number(p.id) === productId);
    setProduct(found || null);
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart({
      ...product,
      quantity: 1
    }));
    toast.success(`${product.name} added to cart!`);
  };

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <FiChevronLeft /> Back
          </button>
          <div className="product-not-found">
            <h2>Product not found</h2>
            <p>The product you're looking for does not exist or was removed.</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <FiChevronLeft /> Back
        </button>

        <div className="product-detail" role="region" aria-label={`Details for ${product.name}`}>
          <div className="product-image" aria-hidden="false">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
            />
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>

            <p className="product-price">{convertAdjustAndFormat(product.price, product.category)}</p>

            {product.discount && product.originalPrice && (
              <p className="product-discount">
                <span className="original">{convertAdjustAndFormat(product.originalPrice, product.category)}</span>
                <span className="off"> {product.discount}% off</span>
              </p>
            )}

            <p className="product-description">{product.description}</p>

            <div className="product-meta" aria-hidden="true">
              <span className="rating">⭐ {product.rating || '—'}</span>
              <span className="reviews">({product.reviews || 0} reviews)</span>
              <span className="category">Category: {product.category}</span>
            </div>

            <div className="product-actions">
              <button className="btn btn-primary" onClick={handleAddToCart} aria-label={`Add ${product.name} to cart`}>
                Add to Cart
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/products')} aria-label="Continue shopping">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
