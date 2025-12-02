// src/pages/Checkout/Checkout.jsx
import React from 'react';
import './Checkout.css';
import { convertAdjustAndFormat } from '../../utils/currency';

const Checkout = () => {
  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-content">
          <div className="checkout-form">
            <h2>Shipping Information</h2>
            <form>
              <div className="form-group">
                <input type="text" placeholder="Full Name" className="input" />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Address" className="input" />
              </div>
              <div className="form-group">
                <input type="text" placeholder="City" className="input" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" placeholder="State" className="input" />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="ZIP Code" className="input" />
                </div>
              </div>
            </form>
          </div>
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-item">
              <span>Product</span>
              <span>{convertAdjustAndFormat(29.99)}</span>
            </div>
            <div className="summary-item">
              <span>Shipping</span>
              <span>{convertAdjustAndFormat(5.99)}</span>
            </div>
            <div className="summary-item total">
              <span>Total</span>
              <span>{convertAdjustAndFormat(35.98)}</span>
            </div>
            <button className="btn btn-primary">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
