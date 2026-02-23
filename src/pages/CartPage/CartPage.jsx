import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, applyCoupon, removeCoupon } from '../../redux/cartSlice';
import { convertAdjustAndFormat } from '../../utils/currency';
import axios from 'axios';
import Recommendations from '../../components/Recommendations/Recommendations';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total, shipping, coupon } = useSelector((state) => state.cart || { items: [], total: 0, shipping: 0, coupon: null });

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Calculate Discount Amount
  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'FLAT') {
      discountAmount = coupon.value;
    } else {
      // Percent
      let eligibleTotal = total;

      // Filter by category if applicable
      if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        const eligibleItems = items.filter(item =>
          coupon.applicableCategories.map(c => c.toLowerCase()).includes((item.category || '').toLowerCase())
        );
        eligibleTotal = eligibleItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }

      discountAmount = (eligibleTotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }
  }
  // Ensure we don't discount more than total
  if (discountAmount > total) discountAmount = total;

  const finalTotal = total + shipping - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponMessage('');
    try {
      const res = await axios.post('https://blissbloomlybackend.onrender.com/api/coupons/validate', { code: couponInput, cartTotal: total, cartItems: items });
      const { valid, message, ...couponData } = res.data;
      if (valid) {
        dispatch(applyCoupon(couponData));
        setCouponMessage(message);
        setCouponInput('');
      } else {
        setCouponMessage(message || 'Invalid Coupon');
      }
    } catch (e) {
      setCouponMessage(e.response?.data?.message || 'Invalid Coupon');
      dispatch(removeCoupon());
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponMessage('');
    setCouponInput('');
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h1>Your Cart is Empty</h1>
          <p>add some items to get started!</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '1rem' }}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <div className="cart-item" key={item.cartId || item.id}>
                <div className="cart-item-image" style={{ backgroundImage: `url(${item.image})` }}>
                  {!item.image && <div style={{ width: '100%', height: '100%', background: '#eee' }} />}
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <div className="cart-variants" style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
                    {item.selectedSize && <span style={{ marginRight: '10px' }}>Size: {item.selectedSize}</span>}
                    {item.selectedColor && <span style={{ marginRight: '10px' }}>Color: {item.selectedColor}</span>}
                    {item.selectedAge && <span style={{ marginRight: '10px' }}>Age: {item.selectedAge}</span>}
                    {item.selectedPack && <span>Pack: {item.selectedPack}</span>}
                  </div>
                  <p>Quantity: {item.quantity}</p>
                  <p className="price">{convertAdjustAndFormat(item.price)}</p>
                </div>
                <button className="remove-btn" onClick={() => dispatch(removeFromCart(item.cartId || item.id))}>×</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{convertAdjustAndFormat(total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{convertAdjustAndFormat(shipping)}</span>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
              {!coupon ? (
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button onClick={handleApplyCoupon} disabled={isApplying}>
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="coupon-applied">
                  <div>
                    <span>Code: <strong>{coupon.code}</strong></span><br />
                    <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                      {coupon.type === 'FLAT' ? `Flat ₹${coupon.value} OFF` : `${coupon.value}% OFF`}
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="remove-coupon-btn">Remove</button>
                </div>
              )}
              {couponMessage && <p className={`coupon-msg ${coupon ? 'success' : 'error'}`}>{couponMessage}</p>}
            </div>

            {(discountAmount > 0) && (
              <div className="summary-row discount" style={{ color: '#166534' }}>
                <span>Discount</span>
                <span>- {convertAdjustAndFormat(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>{convertAdjustAndFormat(finalTotal)}</span>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
      <Recommendations title="You Might Also Like" subtitle="Based on items in your cart" />
    </div>
  );
};

export default CartPage;
