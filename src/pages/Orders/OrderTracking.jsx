import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';
import './OrderTracking.css';
import { FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiBox, FiXCircle, FiRefreshCcw, FiCalendar, FiDollarSign } from 'react-icons/fi';

const OrderTracking = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Return System State
    const [returnReason, setReturnReason] = useState('');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [submittingReturn, setSubmittingReturn] = useState(false);

    // Cancel System State
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [submittingCancel, setSubmittingCancel] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data);
            } catch (err) {
                console.error(err);
                setError("Order not found or access denied.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleReturnRequest = async () => {
        if (!returnReason.trim()) return alert("Please provide a reason");
        setSubmittingReturn(true);
        try {
            await api.put(`/orders/${id}/return`, { reason: returnReason });
            alert("Return requested successfully!");
            setShowReturnModal(false);
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
        } catch (e) {
            console.error(e);
            alert("Failed to request return: " + (e.response?.data?.message || e.message));
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) return alert("Please provide a cancellation reason");
        setSubmittingCancel(true);
        try {
            await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
            alert("Order cancelled successfully!");
            setShowCancelModal(false);
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
        } catch (e) {
            console.error(e);
            alert("Failed to cancel order: " + (e.response?.data?.message || e.message));
        } finally {
            setSubmittingCancel(false);
        }
    };

    if (loading) return <div className="tracking-loading"><div className="spinner"></div> Loading Tracking Info...</div>;
    if (error) return <div className="tracking-error">{error}</div>;
    if (!order) return <div className="tracking-error">Order Not Found</div>;

    const isReturnActive = order.returnStatus && order.returnStatus !== 'none';
    const isCancelled = order.status && order.status.toLowerCase() === 'cancelled';

    // Normal Order Stages
    const orderStages = [
        { key: 'Pending', label: 'Order Placed', icon: <FiBox /> },
        { key: 'Processing', label: 'Processing', icon: <FiPackage /> },
        { key: 'Packed', label: 'Packed', icon: <FiPackage /> },
        { key: 'Shipped', label: 'Shipped', icon: <FiTruck /> },
        { key: 'Out for Delivery', label: 'Out for Delivery', icon: <FiTruck /> },
        { key: 'Delivered', label: 'Delivered', icon: <FiCheckCircle /> }
    ];

    // Return Timeline Stages
    const returnStages = [
        { key: 'requested', label: 'Return Requested', icon: <FiRefreshCcw /> },
        { key: 'approved', label: 'Approved', icon: <FiCheckCircle /> },
        { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: <FiCalendar /> },
        { key: 'out_for_pickup', label: 'Out for Pickup', icon: <FiTruck /> },
        { key: 'picked_up', label: 'Picked Up', icon: <FiPackage /> },
        { key: 'refunded', label: 'Refund Processed', icon: <FiDollarSign /> }
    ];

    const getOrderStageIndex = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered') return 5;
        if (s === 'out for delivery') return 4;
        if (s === 'shipped') return 3;
        if (s === 'packed') return 2;
        if (s === 'processing') return 1;
        return 0;
    };

    const getReturnStageIndex = (rStatus) => {
        const s = rStatus?.toLowerCase();
        if (s === 'refunded' || s === 'completed') return 5;
        if (s === 'picked_up') return 4;
        if (s === 'out_for_pickup') return 3;
        if (s === 'pickup_scheduled') return 2;
        if (s === 'approved') return 1;
        if (s === 'requested') return 0;
        return -1;
    };

    const activeStages = isReturnActive && order.returnStatus !== 'rejected' ? returnStages : orderStages;
    const currentStageIndex = isReturnActive && order.returnStatus !== 'rejected'
        ? getReturnStageIndex(order.returnStatus)
        : getOrderStageIndex(order.status || 'Pending');

    const canCancel = !isCancelled && !isReturnActive && ['Placement', 'Placed', 'Pending', 'Processing', 'Packed'].includes(order.status);

    return (
        <div className="order-tracking-page">
            <div className="container">
                <div className="tracking-header">
                    <h1>Track Order #{order._id.slice(-6).toUpperCase()}</h1>
                    <Link to="/orders" className="back-link">Back to Orders</Link>
                </div>

                <div className="tracking-content">
                    <div className="tracking-summary">
                        {isCancelled ? (
                            <div className="cancelled-banner">
                                <FiXCircle className="cancelled-icon" size={40} />
                                <div className="cancelled-info">
                                    <h3>Order Cancelled</h3>
                                    <p>Reason: {order.cancellationReason || 'No reason provided'}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="summary-item">
                                    <span className="label">Expected Delivery</span>
                                    <span className="value">
                                        {order.expectedDelivery ? new Date(order.expectedDelivery).toDateString() : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="label">Tracking ID</span>
                                    <span className="value">{order.trackingId || 'Pending'}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="tracking-timeline">
                        {/* Status Message */}
                        {isReturnActive && (
                            <div className={`return-status-banner ${order.returnStatus}`} style={{ marginBottom: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534' }}>
                                <h3>Return Status: {order.returnStatus.replace(/_/g, ' ').toUpperCase()}</h3>
                                <p>Reason: {order.returnReason}</p>
                            </div>
                        )}

                        <div className="stages-container">
                            {activeStages.map((stage, index) => {
                                const isCompleted = index <= currentStageIndex;
                                const isCurrent = index === currentStageIndex;
                                return (
                                    <div key={stage.key} className={`stage-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                        <div className="stage-icon">{stage.icon}</div>
                                        <div className="stage-label">{stage.label}</div>
                                    </div>
                                );
                            })}
                            {!isCancelled && (
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${(currentStageIndex / (activeStages.length - 1)) * 100}%` }}></div>
                                </div>
                            )}
                        </div>

                        {/* Request Return Button (Only if delivered and no return) */}
                        {!isReturnActive && !isCancelled && order.status === 'Delivered' && (
                            <div className="return-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                                <button
                                    className="action-btn"
                                    onClick={() => setShowReturnModal(true)}
                                    style={{ background: '#333', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Request Return
                                </button>
                            </div>
                        )}

                        {/* Cancel Button */}
                        {canCancel && (
                            <div className="cancel-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                                <button
                                    className="action-btn danger-btn"
                                    onClick={() => setShowCancelModal(true)}
                                    style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Cancel Order
                                </button>
                            </div>
                        )}

                        <h3>Tracking History</h3>
                        <div className="history-log">
                            {order.trackingHistory && order.trackingHistory.length > 0 ? (
                                order.trackingHistory.slice().reverse().map((event, idx) => (
                                    <div key={idx} className="history-item">
                                        <div className="history-left">
                                            <div className="history-time">
                                                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="history-date">
                                                {new Date(event.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="history-marker"></div>
                                        <div className="history-details">
                                            <h4>{event.status}</h4>
                                            <p>{event.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-history">No updates yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showReturnModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                        <h3>Request Return</h3>
                        <p>Why are you returning this item?</p>
                        <textarea
                            value={returnReason}
                            onChange={e => setReturnReason(e.target.value)}
                            placeholder="e.g. Defective, Wrong item"
                            style={{ width: '100%', minHeight: '100px', margin: '10px 0', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowReturnModal(false)} style={{ padding: '8px 15px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleReturnRequest} disabled={submittingReturn} style={{ padding: '8px 15px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{submittingReturn ? 'Submit' : 'Submitting'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showCancelModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                        <h3>Cancel Order</h3>
                        <p>Are you sure you want to cancel? Please provide a reason.</p>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            placeholder="e.g. Changed my mind, Found better price"
                            style={{ width: '100%', minHeight: '100px', margin: '10px 0', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowCancelModal(false)} style={{ padding: '8px 15px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
                            <button onClick={handleCancelOrder} disabled={submittingCancel} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{submittingCancel ? 'Cancelling...' : 'Confirm Cancel'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
