// src/components/Cart/Cart.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { clearCart, removeFromCart, updateQuantity } from '../../redux/cartSlice';
import './Cart.css';
import { convertAdjustAndFormat } from '../../utils/currency';

const Cart = ({ isCartOpen, setIsCartOpen }) => {
  const dispatch = useDispatch();
  const { items, total, shipping } = useSelector(state => state.cart);

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('cart-open');
    } else {
      document.body.classList.remove('cart-open');
    }
    return () => document.body.classList.remove('cart-open');
  }, [isCartOpen]);

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id, quantity) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Shipping is now handled in Redux
  const grandTotalUSD = calculateSubtotal() + shipping;

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={handleCloseCart}>
      <div className="cart-container" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Shopping Cart</h2>
          <button className="cart-close-btn" onClick={handleCloseCart}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <FiShoppingBag className="cart-empty-icon" />
            <h3>Your cart is empty</h3>
            <p>Add some baby products to get started!</p>
            <Link to="/products" className="btn btn-primary" onClick={handleCloseCart}>
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.cartId || item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x80/f0f9ff/0ea5e9?text=Baby'}
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p className="cart-item-category">{item.category || 'Baby Product'}</p>
                    <div className="cart-item-price">{convertAdjustAndFormat(item.price, item.category)}</div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleUpdateQuantity(item.cartId || item.id, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.cartId || item.id, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={item.quantity >= item.stock}
                      >
                        <FiPlus />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{convertAdjustAndFormat(calculateSubtotal(), items[0]?.category)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{convertAdjustAndFormat(shipping)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>{convertAdjustAndFormat(grandTotalUSD)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
                <Link
                  to="/checkout"
                  className="btn btn-primary"
                  onClick={handleCloseCart}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
