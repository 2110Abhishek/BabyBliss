// src/components/ProductCard/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiEye,
  FiTruck,
  FiCheckCircle
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { useAuth } from '../../context/Authcontext';
import toast from 'react-hot-toast';
import './ProductCard.css';
import { convertAdjustAndFormat } from '../../utils/currency';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const dispatch = useDispatch();

  // safe defaults
  // Prioritize numeric stock if available, otherwise fallback to boolean
  const inStock = product.stock !== undefined ? product.stock > 0 : (product.inStock !== undefined ? product.inStock : true);
  const fastDelivery = !!product.fastDelivery;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const lowStock = product.stock !== undefined && product.stock > 0 && product.stock < 5;

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    // prevent Link navigation
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      toast.error('Item is out of stock');
      return;
    }

    dispatch(addToCart({
      ...product,
      quantity: 1
    }));

    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to use wishlist');
      return;
    }
    const action = await toggleWishlist(product);
    if (action === 'added') toast.success('Added to wishlist!');
    else if (action === 'removed') toast.success('Removed from wishlist');
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="product-card__link">
        <div className="product-card__image-container">
          <div className="product-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-card__image"
              loading="lazy"
            />

            {/* Badges */}
            <div className="product-badges">
              {product.discount ? (
                <span className="product-badge discount">-{product.discount}%</span>
              ) : null}
              {!inStock && <span className="product-badge out-of-stock">Out of Stock</span>}
              {inStock && lowStock && <span className="product-badge low-stock" style={{ background: '#f59e0b' }}>Low Stock</span>}
              {tags.includes('New Arrival') && <span className="product-badge new">New</span>}
            </div>

            {/* Quick actions shown on hover */}
            <div className={`product-card__actions ${isHovered ? 'visible' : ''}`}>
              <button
                className={`product-card__wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FiHeart />
              </button>


            </div>
          </div>

          {/* Add to cart button (separate from Link so we prevent navigation) */}
          <button
            className={`product-card__add-btn ${isHovered ? 'visible' : ''}`}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={inStock ? `Add ${product.name} to cart` : `${product.name} out of stock`}
          >
            <FiShoppingCart />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>

        <div className="product-card__content">
          <div className="product-card__meta">
            <div className="product-card__rating" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`star ${i < Math.floor(product.rating || 0) ? 'filled' : ''} ${i === Math.floor(product.rating || 0) && (product.rating || 0) % 1 >= 0.5 ? 'half-filled' : ''}`}
                />
              ))}
              <span className="product-card__reviews">({product.reviews ?? 0})</span>
            </div>

            {fastDelivery && (
              <div className="fast-delivery" title="Fast delivery available">
                <FiTruck />
                <span>Fast Delivery</span>
              </div>
            )}
          </div>

          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__description">{product.description}</p>

          <div className="product-card__footer">
            <div className="product-card__pricing">
              <span className="product-card__price">
                {convertAdjustAndFormat(product.price, product.category)}
              </span>
              {product.originalPrice ? (
                <span className="product-card__original-price">
                  {convertAdjustAndFormat(product.originalPrice, product.category)}
                </span>
              ) : null}
            </div>

            <div className="product-card__tags">
              <span className="product-card__category">{product.category}</span>
              {inStock && (
                <div className="in-stock" title="In stock">
                  <FiCheckCircle />
                  <span>In Stock</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
