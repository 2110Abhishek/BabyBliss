// src/pages/CartPage/CartPage.jsx
import React from 'react';
import './CartPage.css';
import { convertAdjustAndFormat } from '../../utils/currency';

const CartPage = () => {
  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-item">
              <div className="cart-item-image"></div>
              <div className="cart-item-details">
                <h3>Product Name</h3>
                <p>Quantity: 1</p>
                <p className="price">{convertAdjustAndFormat(29.99)}</p>
              </div>
              <button className="remove-btn">×</button>
            </div>
          </div>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{convertAdjustAndFormat(29.99)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{convertAdjustAndFormat(5.99)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{convertAdjustAndFormat(35.98)}</span>
            </div>
            <button className="btn btn-primary">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
