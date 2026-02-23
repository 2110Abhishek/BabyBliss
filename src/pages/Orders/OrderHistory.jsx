import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/Authcontext';
import api from '../../api/api';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { convertAdjustAndFormat } from '../../utils/currency';
import './OrderHistory.css';

const OrderHistory = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (user) {
                    const response = await api.get(`/orders/user/${user.uid}`);
                    if (response.data && response.data.orders) {
                        setOrders(response.data.orders);
                    } else if (Array.isArray(response.data)) {
                        setOrders(response.data);
                    } else {
                        setOrders([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleCancel = async (orderId) => {
        const reason = window.prompt("Please provide a reason for cancellation:");
        if (reason) {
            try {
                const res = await api.put(`/orders/${orderId}/cancel`, { reason });
                // Update local state
                setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
            } catch (err) {
                console.error("Failed to cancel order", err);
                alert("Failed to cancel order");
            }
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div className="order-history-page container">
            <h1>My Orders</h1>

            {orders.length === 0 ? (
                <div className="empty-orders">
                    <FiShoppingBag size={50} />
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order._id} className="order-card">
                            <div className="order-header">
                                <div>
                                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={`order-status status-${order.status || 'pending'}`}>
                                    {order.status || order.paymentStatus}
                                </div>
                            </div>

                            <div className="order-items-preview">
                                {order.items.map((item, index) => (
                                    <div key={index} className="preview-item">
                                        <img src={item.image} alt={item.name} />
                                        <span>x{item.quantity}</span>
                                        <div className="item-variants" style={{ fontSize: '0.75rem', color: '#666' }}>
                                            {item.selectedSize && <span>{item.selectedSize} </span>}
                                            {item.selectedColor && <span>{item.selectedColor} </span>}
                                            {item.selectedPack && <span>{item.selectedPack}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <span className="order-total">Total: {order.totalFormatted}</span>

                                <div className="order-actions">
                                    <Link to={`/orders/${order._id}/track`} className="track-btn">
                                        Track Order
                                    </Link>
                                    {(order.status === 'pending' || order.status === 'processing') && (
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancel(order._id)}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {order.status === 'cancelled' && order.refundStatus === 'initiated' && (
                                        <span className="refund-badge">Refund Initiated</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
