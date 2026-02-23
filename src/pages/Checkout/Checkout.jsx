import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setShippingAddress, applyCoupon, removeCoupon } from '../../redux/cartSlice';
import { useAuth } from '../../context/Authcontext';
import { convertAdjustAndFormat } from '../../utils/currency';
import axios from 'axios';
import AddressBook from '../../components/AddressBook/AddressBook'; // New Import 
import './Checkout.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { items, total, shipping, coupon } = useSelector((state) => state.cart || { items: [], total: 0, shipping: 0, coupon: null });

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    altPhone: ''
  });

  const [showAddressBook, setShowAddressBook] = useState(false); // State for modal

  /* Save Address State */
  const [saveAddress, setSaveAddress] = useState(false);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  // Fetch Available Coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get('https://blissbloomlybackend.onrender.com/api/coupons'); // Ideally filter by active=true in backend or here
        const active = res.data.filter(c => c.isActive && new Date(c.expiryDate) > new Date());
        setAvailableCoupons(active);
      } catch (e) { console.error("Failed to fetch coupons", e); }
    };
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Handle Submit Triggered");
    console.log("Form Data:", formData);
    console.log("Save Address Checkbox:", saveAddress);
    console.log("User Object:", user);

    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone) {
      alert("Please fill in all required fields (Name, Email, Address, City, State, Zip, Phone)");
      console.log("Validation Failed:", formData);
      return;
    }

    if (saveAddress) {
      if (!user) {
        console.error("User is null, cannot save address");
        alert("Please log in to save address");
      } else {
        console.log("Proceeding to save address...");
        try {
          const payload = {
            uid: user.uid,
            address: {
              name: formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zip: formData.zip,
              phone: formData.phone,
              altPhone: formData.altPhone,
              isDefault: false
            }
          };
          console.log("Payload:", payload);
          const res = await axios.post('https://blissbloomlybackend.onrender.com/api/users/address/add', payload);
          console.log("Save response:", res.data);
          alert("Address Saved to Address Book!");
        } catch (error) {
          console.error("Failed to save address", error);
          alert("Failed to save address: " + (error.response?.data?.message || error.message));
        }
      }
    } else {
      console.log("Save Address is FALSE, skipping save.");
    }

    dispatch(setShippingAddress(formData));
    navigate('/payment');
  };

  const handeApplyCoupon = async (codeOverride) => {
    const codeToApply = codeOverride || couponInput;
    if (!codeToApply.trim()) return;

    setIsApplying(true);
    setCouponMessage('');
    try {
      const res = await axios.post('https://blissbloomlybackend.onrender.com/api/coupons/validate', { code: codeToApply, cartTotal: total, cartItems: items });
      const { valid, message, ...couponData } = res.data; // couponData: { code, type, value, minOrder, maxDiscount, applicableCategories }
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

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-content">
          <div className="checkout-form">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <input type="text" name="name" placeholder="Full Name" className="input" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="email" name="email" placeholder="Email Address" className="input" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="address" placeholder="Address" className="input" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="city" placeholder="City" className="input" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" name="state" placeholder="State" className="input" value={formData.state} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <input type="text" name="zip" placeholder="ZIP Code" className="input" value={formData.zip} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <input type="text" name="phone" placeholder="Phone Number" className="input" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="altPhone" placeholder="Alternate Phone (Optional)" className="input" value={formData.altPhone} onChange={handleChange} />
              </div>

              {user && (
                <div className="form-check" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                    />
                    Save this address for future orders
                  </label>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressBook(!showAddressBook)}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {showAddressBook ? 'Close Address Book' : 'Select Saved Address'}
                </button>
              </div>

              {showAddressBook && (
                <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: '#f9f9f9' }}>
                  <AddressBook
                    selectable
                    onSelectAddress={(addr) => {
                      setFormData({
                        ...formData,
                        name: addr.name,
                        address: addr.address,
                        city: addr.city,
                        state: addr.state,
                        zip: addr.zip,
                        phone: addr.phone,
                        altPhone: addr.altPhone || ''
                      });
                      setShowAddressBook(false);
                    }}
                  />
                </div>
              )}

              <button className="btn btn-primary mobile-only" type="submit">Proceed to Payment</button>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary ({items.length} items)</h2>
            <div className="summary-items-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
              {items.map(item => (
                <div key={item.id} className="summary-item-mini" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>{convertAdjustAndFormat(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal</span>
              <span>{convertAdjustAndFormat(total)}</span>
            </div>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Shipping</span>
              <span>{convertAdjustAndFormat(shipping)}</span>
            </div>

            {/* Coupon Input & Available Offers */}
            <div className="coupon-checkout-section" style={{ marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              {!coupon ? (
                <>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      type="text"
                      placeholder="Promo Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <button
                      onClick={() => handeApplyCoupon()}
                      disabled={isApplying}
                      style={{ padding: '8px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </div>
                  {/* Available Offers List */}
                  {availableCoupons.length > 0 && (
                    <div className="available-coupons" style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>Available Offers</p>
                        {availableCoupons.length > 1 && (
                          <button
                            onClick={() => setShowAllCoupons(!showAllCoupons)}
                            style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {showAllCoupons ? 'View Less' : 'View All'}
                          </button>
                        )}
                      </div>

                      {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 1)).map(c => (
                        <div
                          key={c._id}
                          onClick={() => handeApplyCoupon(c.code)}
                          style={{
                            padding: '8px',
                            border: '1px dashed #ccc',
                            borderRadius: '4px',
                            marginBottom: '5px',
                            cursor: 'pointer',
                            backgroundColor: '#fafafa',
                            transition: 'all 0.2s'
                          }}
                          className="coupon-card"
                        >
                          <div style={{ fontWeight: 'bold', color: '#333' }}>{c.code}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{c.description || (c.type === 'FLAT' ? `Get ₹${c.value} OFF` : `Get ${c.value}% OFF`)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                  <div>
                    <span style={{ color: '#166534', fontSize: '0.9rem', display: 'block' }}>Code: <strong>{coupon.code}</strong> applied!</span>
                    <span style={{ color: '#166534', fontSize: '0.8rem' }}>
                      {coupon.type === 'FLAT' ? `Flat ₹${coupon.value} OFF` : `${coupon.value}% OFF ${coupon.maxDiscount ? `(Max ₹${coupon.maxDiscount})` : ''}`}
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Remove</button>
                </div>
              )}
              {couponMessage && <p style={{ fontSize: '0.8rem', marginTop: '5px', color: (coupon ? '#166534' : '#dc2626') }}>{couponMessage}</p>}
            </div>

            {(discountAmount > 0) && (
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#166534' }}>
                <span>Discount</span>
                <span>- {convertAdjustAndFormat(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
              <span>Total</span>
              <span>{convertAdjustAndFormat(finalTotal)}</span>
            </div>

            <button className="btn btn-primary desktop-only" onClick={handleSubmit}>Proceed to Payment</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;