import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../redux/cartSlice';
import { convertAdjustAndFormat } from '../../utils/currency';
import { FiCreditCard, FiPackage, FiLoader, FiShield } from 'react-icons/fi';
import './Payment.css';
import { auth } from '../../firebase/firebase';
import api from '../../api/api';

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { items, total, shipping, shippingAddress, coupon } = useSelector((state) => state.cart);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!shippingAddress || items.length === 0) {
            navigate('/cart');
        }
    }, [shippingAddress, items, navigate]);

    // Calculate Discount Amount
    let discountAmount = 0;
    if (coupon) {
        if (coupon.type === 'FLAT') {
            discountAmount = coupon.value;
        } else {
            // Percent
            discountAmount = (total * coupon.value) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }
    }
    // Ensure we don't discount more than total
    if (discountAmount > total) discountAmount = total;

    const finalTotal = total + shipping - discountAmount;

    const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'

    const handlePayment = async () => {
        if (paymentMethod === 'cod') {
            placeOrderAfterPayment("pending", "cod");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Get Key
            const { data: { key } } = await api.get('/payment/key');

            // 2. Create Order
            const { data: order } = await api.post('/payment/create-order', {
                amount: finalTotal
            });

            // 3. Initialize Razorpay
            const options = {
                key: key,
                amount: order.amount,
                currency: "INR",
                name: "BlissBloomly Store",
                description: "Purchase of Baby Products",
                // image: window.location.origin + "/logo192.png", // Commented out to fix Mixed Content Error on Localhost (HTTP vs HTTPS)
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        const verifyRes = await api.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            // 5. Place Order in DB
                            placeOrderAfterPayment("completed", "online", response.razorpay_payment_id);
                        } else {
                            setError("Payment Verification Failed");
                        }
                    } catch (err) {
                        console.error(err);
                        setError("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: shippingAddress?.fullName || "",
                    email: auth.currentUser?.email || "",
                    contact: shippingAddress?.phone || ""
                },
                notes: {
                    address: shippingAddress?.address
                },
                theme: {
                    color: "#ff6b81"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setError(response.error.description);
            });
            rzp1.open();

        } catch (err) {
            console.error("Payment Start Error", err);
            setError("Could not initiate payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const placeOrderAfterPayment = async (status, method, paymentId = null) => {
        setLoading(true);
        const currentUser = auth.currentUser;
        const uid = currentUser ? currentUser.uid : null;

        try {
            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    priceFormatted: convertAdjustAndFormat(item.price),
                    quantity: item.quantity,
                    image: item.image,
                    selectedSize: item.selectedSize,
                    selectedColor: item.selectedColor,
                    selectedAge: item.selectedAge,
                    selectedPack: item.selectedPack
                })),
                subtotal: total.toFixed(2),
                shipping: shipping,
                discountPercent: coupon?.type === 'PERCENT' ? coupon?.value : 0,
                discountAmount: discountAmount.toFixed(2),
                couponCode: coupon?.code,
                total: finalTotal.toFixed(2),
                totalFormatted: convertAdjustAndFormat(finalTotal),
                customer: shippingAddress,
                paymentMethod: method,
                paymentStatus: status,
                firebaseUid: uid,
                paymentId: paymentId
            };

            const response = await api.post('/orders', orderData);

            if (response.status === 201) {
                // Clear cart logic moved to OrderSuccess.jsx to prevent race condition
                navigate('/order-success', {
                    state: { orderId: response.data._id },
                    replace: true
                });
            }
        } catch (err) {
            console.error("Order Save Error", err);
            setError("Payment successful but failed to save order. Please contact support.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="payment-page">
            <div className="container">
                <h1>Payment Method</h1>

                <div className="payment-content">
                    <div className="payment-options">
                        {/* Online Payment Option */}
                        <div
                            className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('online')}
                        >
                            <div className="option-header">
                                <input type="radio" checked={paymentMethod === 'online'} readOnly />
                                <span className="option-icon"><FiCreditCard /></span>
                                <span className="option-title">Pay via Razorpay (UPI / Cards / NetBanking)</span>
                            </div>
                        </div>

                        {/* COD Option */}
                        <div
                            className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('cod')}
                        >
                            <div className="option-header">
                                <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                                <span className="option-icon"><FiPackage /></span>
                                <span className="option-title">Cash on Delivery</span>
                            </div>
                        </div>
                    </div>

                    <div className="payment-card">
                        <div className="amount-display">
                            <span>Amount to Pay</span>
                            <h2>{convertAdjustAndFormat(finalTotal)}</h2>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button
                            className="btn btn-primary pay-btn"
                            onClick={handlePayment}
                            disabled={loading}
                        >
                            {loading ? (
                                <><FiLoader className="spin" /> Processing...</>
                            ) : (
                                paymentMethod === 'online' ?
                                    <>Pay Now (Online)</> :
                                    <>Place Order (COD)</>
                            )}
                        </button>

                        {paymentMethod === 'online' && (
                            <div className="secure-badge">
                                <FiShield /> 100% Secure Payment via Razorpay
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
