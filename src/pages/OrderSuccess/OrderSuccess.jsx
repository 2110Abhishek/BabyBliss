import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import { FiCheckCircle, FiShoppingBag, FiLoader, FiPrinter, FiPackage, FiMapPin } from 'react-icons/fi';
import api from '../../api/api';
import { convertAdjustAndFormat } from '../../utils/currency';

const OrderSuccess = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${orderId}`);
                setOrder(res.data);
                // Clear cart only after we confirm order exists to avoid bad UX
                dispatch(clearCart());
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        window.scrollTo(0, 0);
    }, [orderId, dispatch, navigate]);

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
            <FiLoader className="spin" size={40} color="#ff6b6b" />
            <p>Loading Order Details...</p>
        </div>
    );

    if (!order) return (
        <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h2>Order Not Found</h2>
            <Link to="/">Return to Home</Link>
        </div>
    );

    return (
        <div style={{
            minHeight: '80vh',
            background: '#f8f9fa',
            padding: '2rem 1rem'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '3rem 2rem',
                    textAlign: 'center'
                }}>
                    <FiCheckCircle size={60} style={{ marginBottom: '1rem' }} />
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>Order Confirmed!</h1>
                    <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Thank you for your purchase.</p>
                    <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '8px', maxWidth: '100%', wordBreak: 'break-all' }}>
                        Order ID: <strong>{order._id}</strong>
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
                                <FiMapPin /> Shipping Address
                            </h3>
                            <div style={{ marginTop: '1rem', color: '#666', lineHeight: '1.6' }}>
                                <strong>{order.customer.name}</strong><br />
                                {order.customer.address}, {order.customer.city}<br />
                                {order.customer.state} - {order.customer.zip}<br />
                                Phone: {order.customer.phone}
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#555' }}>
                                <FiPackage /> Order Info
                            </h3>
                            <div style={{ marginTop: '1rem', color: '#666', lineHeight: '1.6' }}>
                                Method: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong><br />
                                Status: <span style={{ textTransform: 'capitalize', color: order.paymentStatus === 'completed' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{order.paymentStatus}</span><br />
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#555' }}>Order Items</h3>
                    <div style={{ marginBottom: '2rem' }}>
                        {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f1f1f1' }}>
                                <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: '#333' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Qty: {item.quantity}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                        {item.selectedSize && <span style={{ marginRight: '10px' }}>Size: {item.selectedSize}</span>}
                                        {item.selectedColor && <span style={{ marginRight: '10px' }}>Color: {item.selectedColor}</span>}
                                        {item.selectedAge && <span style={{ marginRight: '10px' }}>Age: {item.selectedAge}</span>}
                                        {item.selectedPack && <span>Pack: {item.selectedPack}</span>}
                                    </div>
                                </div>
                                <div style={{ fontWeight: '600', color: '#333' }}>
                                    {convertAdjustAndFormat(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Subtotal</span>
                            <span>{convertAdjustAndFormat(order.subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Shipping</span>
                            <span>{convertAdjustAndFormat(order.shipping)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10b981' }}>
                                <span>Discount</span>
                                <span>- {convertAdjustAndFormat(order.discountAmount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span>{convertAdjustAndFormat(order.total)}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#333', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                            <FiShoppingBag /> Continue Shopping
                        </Link>
                        <button onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'white', border: '1px solid #ddd', color: '#333', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                            <FiPrinter /> Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
