import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/Authcontext';
import { auth } from '../../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiLoader, FiAlertCircle, FiCheckCircle, FiXCircle, FiTrash2, FiBell, FiBriefcase, FiClock, FiEdit2 } from 'react-icons/fi';
import Pagination from '../../components/Pagination';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');

    // Pagination State
    const [usersPage, setUsersPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [sellersPage, setSellersPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [ordersTotalPages, setOrdersTotalPages] = useState(1);
    const [sellersTotalPages, setSellersTotalPages] = useState(1);

    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [analytics, setAnalytics] = useState(null); // Analytics Data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterEmail, setFilterEmail] = useState(null);

    // Seller State
    const [sellers, setSellers] = useState([]);
    const [viewingProducts, setViewingProducts] = useState(null);
    const [sellerInView, setSellerInView] = useState(null);
    const [sellerFilter, setSellerFilter] = useState('all');

    // Coupon State
    const [coupons, setCoupons] = useState([]);
    const [creatingCoupon, setCreatingCoupon] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [couponForm, setCouponForm] = useState({ type: 'PERCENT', value: '', code: '', expiryDate: '', minOrderValue: '', maxDiscount: '', description: '', applicableCategories: '' });
    const [kpiDetail, setKpiDetail] = useState(null); // 'revenue' | 'products'
    const [allProductsList, setAllProductsList] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsSearch, setProductsSearch] = useState('');
    const [viewingAllProducts, setViewingAllProducts] = useState(false);

    const handleCouponChange = (e) => setCouponForm({ ...couponForm, [e.target.name]: e.target.value });

    // Helper to format categories for display/input (array <-> comma-separated string)
    const formatCategories = (cats) => Array.isArray(cats) ? cats.join(', ') : cats;
    const parseCategories = (catString) => catString.split(',').map(c => c.trim()).filter(c => c);

    const handleCreateOrUpdateCoupon = async () => {
        try {
            let token = await auth.currentUser.getIdToken();
            const payload = {
                ...couponForm,
                applicableCategories: parseCategories(couponForm.applicableCategories)
            };

            if (editingCoupon) {
                // Update existing
                await axios.put(`https://blissbloomlybackend.onrender.com/api/coupons/${editingCoupon._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Coupon Updated!");
            } else {
                // Create new
                await axios.post('https://blissbloomlybackend.onrender.com/api/coupons', payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Coupon Created & Notification Sent!");
            }

            setCreatingCoupon(false);
            setEditingCoupon(null);
            setCouponForm({ type: 'PERCENT', value: '', code: '', expiryDate: '', minOrderValue: '', maxDiscount: '', description: '', applicableCategories: '' });
            const res = await axios.get('https://blissbloomlybackend.onrender.com/api/coupons', { headers: { Authorization: `Bearer ${token}` } });
            setCoupons(res.data);
        } catch (e) {
            alert("Failed: " + (e.response?.data?.message || e.message));
        }
    };

    const openEditCoupon = (coupon) => {
        setEditingCoupon(coupon);
        setCouponForm({
            type: coupon.type || 'PERCENT',
            value: coupon.value,
            code: coupon.code,
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount,
            description: coupon.description,
            applicableCategories: formatCategories(coupon.applicableCategories || [])
        });
        setCreatingCoupon(true); // Re-use the modal
    };



    // Status Update State
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        if (user?.email !== 'blissbloomly@gmail.com') {
            navigate('/');
            return;
        }

        const fetchData = async (background = false) => {
            if (!background) setLoading(true);
            setError('');
            try {
                let token = '';
                if (user && typeof user.getIdToken === 'function') {
                    token = await user.getIdToken();
                } else if (auth.currentUser) {
                    token = await auth.currentUser.getIdToken();
                } else {
                    console.error("No user found to get token");
                    setError("Auth Error: Could not verify identity.");
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                if (activeTab === 'users') {
                    const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/users', config);
                    setUsers(res.data);
                    setUsersTotalPages(Math.ceil(res.data.length / 10)); // Client-side calc
                } else if (activeTab === 'orders') {
                    const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/orders', { ...config, params: { page: ordersPage, limit: 10 } });
                    if (res.data.orders) {
                        setOrders(res.data.orders);
                        setOrdersTotalPages(res.data.totalPages);
                        setOrdersPage(res.data.currentPage);
                    } else {
                        setOrders(res.data); // Fallback
                    }
                } else if (activeTab === 'requests') {
                    const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/requests', config);
                    setRequests(res.data);
                } else if (activeTab === 'sellers') {
                    const statusParam = sellerFilter === 'all' ? '' : `&status=${sellerFilter}`;
                    // Note: backend expects ?status=...&page=...
                    // So we construct url carefully or use params object if axios supports key overlap
                    const res = await axios.get('https://blissbloomlybackend.onrender.com/api/sellers', { ...config, params: { status: sellerFilter === 'all' ? undefined : sellerFilter, page: sellersPage, limit: 10 } });

                    if (res.data.sellers) {
                        setSellers(res.data.sellers);
                        setSellersTotalPages(res.data.totalPages);
                        setSellersPage(res.data.currentPage);
                    } else {
                        setSellers(res.data);
                    }
                } else if (activeTab === 'coupons') {
                    const res = await axios.get('https://blissbloomlybackend.onrender.com/api/coupons', config);
                    setCoupons(res.data);
                } else if (activeTab === 'analytics') {
                    const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/analytics', config);
                    setAnalytics(res.data);
                }

            } catch (err) {
                console.error("Admin Fetch Error", err);
                if (!background) setError(err.response?.data?.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [activeTab, user, currentUser, navigate, sellerFilter, ordersPage, sellersPage]);

    // Client-side pagination helper for Users
    const getPaginatedUsers = () => {
        const startIndex = (usersPage - 1) * 10;
        return users.slice(startIndex, startIndex + 10);
    };

    // ... (Handlers for Users, Orders, Sellers - same as before) ...
    const handleApproveSeller = async (sellerId) => {
        if (!window.confirm("Approve this seller account?")) return;
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.put(`https://blissbloomlybackend.onrender.com/api/sellers/${sellerId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert("Seller Approved!");
            const statusParam = sellerFilter === 'all' ? '' : `?status=${sellerFilter}`;
            const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/sellers${statusParam}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.sellers) {
                setSellers(res.data.sellers);
                setSellersTotalPages(res.data.totalPages);
            } else {
                setSellers(res.data);
            }
        } catch (e) { console.error(e); alert("Failed to approve seller."); }
    };
    const handleBlockSeller = async (sellerId) => {
        if (!window.confirm("Block this seller account?")) return;
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.put(`https://blissbloomlybackend.onrender.com/api/sellers/${sellerId}/block`, {}, { headers: { Authorization: `Bearer ${token}` } });
            alert("Seller Blocked!");
            const statusParam = sellerFilter === 'all' ? '' : `?status=${sellerFilter}`;
            const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/sellers${statusParam}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.sellers) {
                setSellers(res.data.sellers);
                setSellersTotalPages(res.data.totalPages);
            } else {
                setSellers(res.data);
            }
        } catch (e) { console.error(e); alert("Failed to block seller."); }
    };
    const handleDeleteSeller = async (sellerId) => {
        if (!window.confirm("DELETE this seller permanently?")) return;
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.delete(`https://blissbloomlybackend.onrender.com/api/sellers/${sellerId}`, { headers: { Authorization: `Bearer ${token}` } });
            alert("Seller Deleted!");
            const statusParam = sellerFilter === 'all' ? '' : `?status=${sellerFilter}`;
            const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/sellers${statusParam}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.sellers) {
                setSellers(res.data.sellers);
                setSellersTotalPages(res.data.totalPages);
            } else {
                setSellers(res.data);
            }
        } catch (e) { console.error(e); alert("Failed to delete seller."); }
    };
    const handleViewProducts = async (seller) => {
        try {
            let token = await auth.currentUser.getIdToken();
            const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/products/seller/${seller.userId}`, { headers: { Authorization: `Bearer ${token}` } });
            setViewingProducts({ sellerId: seller._id, sellerName: seller.businessName, products: res.data });
        } catch (e) { console.error(e); alert("Failed to fetch products."); }
    };
    const handleBlock = async (uid, email) => {
        if (!window.confirm("Block this user?")) return;
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.post('https://blissbloomlybackend.onrender.com/api/admin/block', { uid, email }, { headers: { Authorization: `Bearer ${token}` } });
            alert("User Blocked successfully.");
            window.location.reload();
        } catch (e) { console.error(e); alert("Failed."); }
    };
    const handleUnblock = async (uid, email) => {
        if (!window.confirm("Unblock this user?")) return;
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.post('https://blissbloomlybackend.onrender.com/api/admin/unblock', { uid, email }, { headers: { Authorization: `Bearer ${token}` } });
            alert("User Unblocked successfully.");
            window.location.reload();
        } catch (e) { console.error(e); alert("Failed."); }
    };
    const handleDelete = async (uid, email) => {
        if (!window.confirm("DELETE this user account?")) return;
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.post('https://blissbloomlybackend.onrender.com/api/admin/delete', { uid, email }, { headers: { Authorization: `Bearer ${token}` } });
            alert("User Deleted permanently.");
            window.location.reload();
        } catch (e) { console.error(e); alert("Failed."); }
    };
    const viewUserOrders = (email) => { setFilterEmail(email); setActiveTab('orders'); };

    const [notifTitle, setNotifTitle] = useState('');
    const [notifBody, setNotifBody] = useState('');
    const [sending, setSending] = useState(false);

    const handleSendNotification = async () => {
        if (!notifTitle || !notifBody) { alert("Title and Body required"); return; }
        if (!window.confirm("Send to ALL subscribers?")) return;
        setSending(true);
        try {
            await axios.post('https://blissbloomlybackend.onrender.com/api/notifications/send', { title: notifTitle, body: notifBody });
            alert("Sent!");
            setNotifTitle(''); setNotifBody('');
        } catch (e) { console.error(e); alert("Failed."); } finally { setSending(false); }
    };

    const openStatusModal = (order) => {
        setEditingOrder(order);
        setNewStatus(order.status || 'Pending');
        setNewLocation('Warehouse');
        setNewDescription('');
    };

    const handleUpdateStatus = async () => {
        if (!editingOrder) return;
        setStatusUpdating(true);
        try {
            let token = await auth.currentUser.getIdToken();
            await axios.put(`https://blissbloomlybackend.onrender.com/api/orders/${editingOrder._id}/status`, {
                status: newStatus, location: newLocation, description: newDescription
            }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Updated!");
            setEditingOrder(null);
            const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
            setOrders(res.data);
        } catch (e) { console.error(e); alert("Failed."); } finally { setStatusUpdating(false); }
    };

    return (
        <div className="admin-dashboard">
            <div className="container">
                <h1>Admin Dashboard</h1>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><FiBriefcase /> Analytics</button>
                    <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><FiUsers /> Users</button>
                    <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><FiShoppingBag /> Orders</button>
                    <button className={`tab-btn ${activeTab === 'sellers' ? 'active' : ''}`} onClick={() => setActiveTab('sellers')}><FiBriefcase /> Seller Approvals</button>
                    <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}><FiAlertCircle /> Requests {requests.length > 0 && <span className="req-badge">{requests.length}</span>}</button>
                    <button className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}><FiBell /> Push Notifs</button>
                    <button className={`tab-btn ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => setActiveTab('coupons')}><FiBriefcase /> Coupons</button>
                    <button className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}><FiClock /> Returns</button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {loading ? <div className="loading"><FiLoader className="spin" /> Loading Data...</div> : (
                    <div className="admin-content">

                        {activeTab === 'analytics' && (
                            <div className="analytics-view">
                                <h2>Dashboard Overview</h2>
                                {loading ? <p>Loading Analytics...</p> : (
                                    <>
                                        {/* KPI Cards */}
                                        <div className="analytics-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                            <div className="kpi-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                <h3 style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Total Revenue</h3>
                                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#10b981' }}>₹{analytics?.totalRevenue?.toLocaleString()}</p>
                                            </div>
                                            <div className="kpi-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                <h3 style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Total Orders</h3>
                                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#3b82f6' }}>{analytics?.totalOrders}</p>
                                            </div>
                                            <div className="kpi-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                <h3 style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Total Users</h3>
                                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#8b5cf6' }}>{analytics?.totalUsers}</p>
                                            </div>
                                            <div className="kpi-card" style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                <h3 style={{ margin: 0, color: '#666', fontSize: '1rem' }}>Products</h3>
                                                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#f59e0b' }}>{analytics?.totalProducts}</p>
                                            </div>
                                        </div>

                                        <div className="analytics-charts" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            {/* Sales Trend Chart */}
                                            <div style={{ flex: '2', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                                                <h3>Sales Trend (Last 7 Days)</h3>
                                                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '10px', marginTop: '20px' }}>
                                                    {analytics?.salesTrend?.map((day, i) => {
                                                        const maxVal = Math.max(...analytics.salesTrend.map(d => d.revenue), 100);
                                                        const heightPercent = (day.revenue / maxVal) * 100;
                                                        return (
                                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                <div
                                                                    title={`₹${day.revenue}`}
                                                                    style={{
                                                                        width: '100%',
                                                                        background: '#3b82f6',
                                                                        height: `${Math.max(heightPercent, 2)}%`,
                                                                        borderRadius: '4px 4px 0 0',
                                                                        transition: 'height 0.3s ease'
                                                                    }}
                                                                ></div>
                                                                <span style={{ fontSize: '0.75rem', marginTop: '5px', textAlign: 'center' }}>
                                                                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Top Products */}
                                            <div style={{ flex: '1', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '300px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h3 style={{ margin: 0 }}>Top Selling Products</h3>
                                                    {analytics?.allProductSales?.length > 0 && (
                                                        <button
                                                            onClick={() => setViewingAllProducts(true)}
                                                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', padding: 0 }}
                                                        >
                                                            View All
                                                        </button>
                                                    )}
                                                </div>
                                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                                                    {analytics?.topProducts?.map((p, i) => (
                                                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                                                            <span style={{ fontWeight: '500' }}>{p.name}</span>
                                                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9rem' }}>{p.qty} sold</span>
                                                        </li>
                                                    ))}
                                                    {analytics?.topProducts?.length === 0 && <p>No sales yet.</p>}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'users' && (
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead><tr><th>Email</th><th>Name</th><th>Last Login</th><th>Verified?</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {getPaginatedUsers().map(u => (
                                            <tr key={u.uid}>
                                                <td><span className="user-email-link" onClick={() => viewUserOrders(u.email)}>{u.email}</span>{u.disabled && <span style={{ color: 'red', marginLeft: '8px' }}><FiXCircle /></span>}</td>
                                                <td>{u.displayName || 'N/A'}</td>
                                                <td>{u.lastSignInTime ? new Date(u.lastSignInTime).toLocaleDateString() : 'N/A'}</td>
                                                <td>{u.emailVerified ? 'Yes' : 'No'}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {u.disabled ? <button className="action-btn success" onClick={() => handleUnblock(u.uid, u.email)}><FiCheckCircle /> Unblock</button> : <button className="action-btn danger" onClick={() => handleBlock(u.uid, u.email)}><FiXCircle /> Block</button>}
                                                        <button className="action-btn delete" onClick={() => handleDelete(u.uid, u.email)}><FiTrash2 /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination
                                    currentPage={usersPage}
                                    totalPages={usersTotalPages}
                                    onPageChange={setUsersPage}
                                />
                            </div>
                        )}
                        {activeTab === 'orders' && (
                            <div className="table-responsive">
                                {filterEmail && <div className="filter-banner"><span>Orders for: <strong>{filterEmail}</strong></span><button className="text-btn" onClick={() => setFilterEmail(null)}>Clear Filter</button></div>}
                                <table className="admin-table">
                                    <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {orders.filter(o => !filterEmail || o.customer.email === filterEmail).map(o => (
                                            <tr key={o._id}>
                                                <td className="mono">{o._id.substring(0, 10)}...</td>
                                                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                                <td><div>{o.customer.name}</div><div style={{ fontSize: '0.8rem', color: '#666' }}>{o.customer.email}</div></td>
                                                <td><div className="order-items-list">{o.items && o.items.map((item, idx) => <div key={idx} className="order-item-small">{item.quantity}x {item.name}</div>)}</div></td>
                                                <td>{o.totalFormatted || `₹${o.total}`}</td>
                                                <td><span className={`status-badge ${o.status?.toLowerCase()}`}>{o.status || 'Pending'}</span></td>
                                                <td>{o.paymentMethod.toUpperCase()}</td>
                                                <td><button className="action-btn" onClick={() => openStatusModal(o)}><FiCheckCircle /> Update</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination
                                    currentPage={ordersPage}
                                    totalPages={ordersTotalPages}
                                    onPageChange={setOrdersPage}
                                />
                            </div>
                        )}

                        {activeTab === 'sellers' && (
                            <div className="table-responsive">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <h2>Seller Management</h2>
                                    <select value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)} style={{ padding: '8px' }}>
                                        <option value="all">All Sellers</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                    </select>
                                </div>
                                <table className="admin-table">
                                    <thead><tr><th>Business</th><th>Email</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {sellers.map(s => (
                                            <tr key={s._id}>
                                                <td><strong>{s.businessName}</strong></td>
                                                <td>{s.email}</td>
                                                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                                <td>{s.verificationStatus}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="action-btn" onClick={() => setSellerInView(s)} style={{ background: '#6366f1', color: 'white' }}>View Details</button>
                                                        <button className="action-btn" onClick={() => handleViewProducts(s)} style={{ background: '#10b981', color: 'white' }}><FiShoppingBag /> Products</button>
                                                        <button className="action-btn delete" onClick={() => handleDeleteSeller(s._id)}><FiTrash2 /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination
                                    currentPage={sellersPage}
                                    totalPages={sellersTotalPages}
                                    onPageChange={setSellersPage}
                                />
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="requests-view">
                                <h2>Unblock Appeals</h2>
                                {requests.length === 0 ? <p>No pending requests.</p> : (
                                    <div className="requests-grid">
                                        {requests.map(req => (
                                            <div key={req._id} className="request-card">
                                                <div className="req-header"><strong>{req.email}</strong><span className="req-date">{new Date(req.createdAt).toLocaleDateString()}</span></div>
                                                <p>"{req.reason}"</p>
                                                <button className="action-btn success" onClick={() => handleUnblock(req.uid, req.email)}>Unblock User</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="notifications-view">
                                <div className="notifications-card">
                                    <div className="card-header">
                                        <FiBell className="card-icon" />
                                        <div>
                                            <h2>Send Push Notification</h2>
                                            <p className="card-subtitle">Broadcast a message to all users instantly.</p>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>TITLE</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter notification title"
                                            value={notifTitle}
                                            onChange={(e) => setNotifTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>MESSAGE</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Enter message details"
                                            rows="4"
                                            value={notifBody}
                                            onChange={(e) => setNotifBody(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        className="action-btn broadcast-btn"
                                        onClick={handleSendNotification}
                                        disabled={sending}
                                    >
                                        {sending ? 'Sending...' : 'Send Broadcast'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'coupons' && (
                            <div className="coupons-view">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h2>Coupon Management</h2>
                                    <button className="action-btn success" onClick={() => setCreatingCoupon(true)}>+ Create Coupon</button>
                                </div>
                                {coupons.length === 0 ? <p>No coupons found.</p> : (
                                    <div className="table-responsive">
                                        <table className="admin-table">
                                            <thead><tr><th>Code</th><th>Offer</th><th>Categories</th><th>Min Order</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {coupons.map(c => (
                                                    <tr key={c._id}>
                                                        <td><strong>{c.code}</strong><br /><span style={{ fontSize: '0.8rem', color: '#666' }}>{c.description}</span></td>
                                                        <td>
                                                            {c.type === 'FLAT' ? `₹${c.value} OFF` : `${c.value}% OFF`}
                                                            {c.maxDiscount && <div style={{ fontSize: '0.8rem' }}>Max: ₹{c.maxDiscount}</div>}
                                                        </td>
                                                        <td>{c.applicableCategories && c.applicableCategories.length > 0 ? c.applicableCategories.join(', ') : 'All'}</td>
                                                        <td>{c.minOrderValue > 0 ? `₹${c.minOrderValue}` : '-'}</td>
                                                        <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
                                                        <td>{new Date() > new Date(c.expiryDate) ? <span style={{ color: 'red' }}>Expired</span> : c.isActive ? <span style={{ color: 'green' }}>Active</span> : 'Inactive'}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button className="action-btn" onClick={() => openEditCoupon(c)}><FiEdit2 /> Edit</button>
                                                                <button className="action-btn delete" onClick={async () => {
                                                                    if (!window.confirm("Delete this coupon?")) return;
                                                                    try {
                                                                        let token = await auth.currentUser.getIdToken();
                                                                        await axios.delete(`https://blissbloomlybackend.onrender.com/api/coupons/${c._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                                        setCoupons(prev => prev.filter(item => item._id !== c._id));
                                                                    } catch (e) { alert("Failed to delete"); }
                                                                }}><FiTrash2 /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'returns' && (
                            <div className="returns-view">
                                <h2>Return Requests</h2>
                                {orders.filter(o => o.returnStatus !== 'none').length === 0 ? <p>No return requests.</p> : (
                                    <table className="admin-table">
                                        <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            {orders.filter(o => o.returnStatus !== 'none').map(o => (
                                                <tr key={o._id}>
                                                    <td className="mono">{o._id.substring(0, 10)}...</td>
                                                    <td>{o.customer.email}</td>
                                                    <td>{o.items.length} items (Total: {o.totalFormatted})</td>
                                                    <td>{o.returnReason}</td>
                                                    <td><span className={`status-badge ${o.returnStatus}`}>{o.returnStatus}</span></td>
                                                    <td>
                                                        {o.returnStatus === 'requested' && (
                                                            <div className="action-buttons">
                                                                <button className="action-btn success" onClick={async () => {
                                                                    if (!window.confirm("Approve Return?")) return;
                                                                    try {
                                                                        let token = await auth.currentUser.getIdToken();
                                                                        await axios.put(`https://blissbloomlybackend.onrender.com/api/orders/${o._id}/return-action`, { action: 'approve' }, { headers: { Authorization: `Bearer ${token}` } });
                                                                        alert("Approved!");
                                                                        // Refresh
                                                                        const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
                                                                        setOrders(res.data);
                                                                    } catch (e) { alert("Failed"); }
                                                                }}><FiCheckCircle /> Approve</button>

                                                                <button className="action-btn danger" onClick={async () => {
                                                                    if (!window.confirm("Reject Return?")) return;
                                                                    try {
                                                                        let token = await auth.currentUser.getIdToken();
                                                                        await axios.put(`https://blissbloomlybackend.onrender.com/api/orders/${o._id}/return-action`, { action: 'reject' }, { headers: { Authorization: `Bearer ${token}` } });
                                                                        alert("Rejected!");
                                                                        // Refresh
                                                                        const res = await axios.get('https://blissbloomlybackend.onrender.com/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } });
                                                                        setOrders(res.data);
                                                                    } catch (e) { alert("Failed"); }
                                                                }}><FiXCircle /> Reject</button>
                                                            </div>
                                                        )}
                                                        {o.returnStatus === 'approved' && <span style={{ color: 'green' }}>Approved</span>}
                                                        {o.returnStatus === 'rejected' && <span style={{ color: 'red' }}>Rejected</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {editingOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Update Status</h2>
                        <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                            <option value="Pending">Pending</option><option value="Confirmed">Confirmed</option><option value="Processing">Processing</option><option value="Picked">Picked</option><option value="Packed">Packed</option><option value="Shipped">Shipped</option><option value="Out for Delivery">Out for Delivery</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
                        </select>
                        <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Location" />
                        <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Description" />
                        <div className="modal-actions"><button onClick={handleUpdateStatus} disabled={statusUpdating}>Save</button><button onClick={() => setEditingOrder(null)}>Cancel</button></div>
                    </div>
                </div>
            )}

            {creatingCoupon && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h2>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                        <div className="form-group"><label>Code</label><input type="text" className="form-control" name="code" value={couponForm.code} onChange={handleCouponChange} placeholder="e.g. SUMMER50" /></div>
                        <div className="form-group"><label>Description</label><input type="text" className="form-control" name="description" value={couponForm.description} onChange={handleCouponChange} placeholder="e.g. 50% off summer items" /></div>
                        <div className="form-group"><label>Categories (Comma separated, optional)</label><input type="text" className="form-control" name="applicableCategories" value={couponForm.applicableCategories} onChange={handleCouponChange} placeholder="e.g. Clothes, Toys (Leave empty for all)" /></div>
                        <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                            <div className="form-group" style={{ flex: 1 }}><label>Type</label>
                                <select className="form-control" name="type" value={couponForm.type} onChange={handleCouponChange}>
                                    <option value="PERCENT">Percentage (%)</option>
                                    <option value="FLAT">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}><label>Value</label><input type="number" className="form-control" name="value" value={couponForm.value} onChange={handleCouponChange} placeholder="10" /></div>
                        </div>
                        <div className="form-row" style={{ display: 'flex', gap: '10px' }}>
                            <div className="form-group" style={{ flex: 1 }}><label>Min Order (₹)</label><input type="number" className="form-control" name="minOrderValue" value={couponForm.minOrderValue} onChange={handleCouponChange} placeholder="0" /></div>
                            <div className="form-group" style={{ flex: 1 }}><label>Max Discount (₹)</label><input type="number" className="form-control" name="maxDiscount" value={couponForm.maxDiscount} onChange={handleCouponChange} placeholder="Optional" /></div>
                        </div>
                        <div className="form-group"><label>Expiry Date</label><input type="date" className="form-control" name="expiryDate" value={couponForm.expiryDate} onChange={handleCouponChange} /></div>

                        <div className="modal-actions">
                            <button onClick={handleCreateOrUpdateCoupon} className="action-btn success">{editingCoupon ? 'Update Coupon' : 'Create & Notify'}</button>
                            <button onClick={() => { setCreatingCoupon(false); setEditingCoupon(null); }} className="action-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {viewingProducts && (
                <div className="modal-overlay" onClick={() => setViewingProducts(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <h2>Products by {viewingProducts.sellerName}</h2>
                        {viewingProducts.products.length === 0 ? <p>No products listed.</p> : (
                            <table className="admin-table">
                                <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th></tr></thead>
                                <tbody>
                                    {viewingProducts.products.map(p => (
                                        <tr key={p._id}>
                                            <td><img src={p.image} alt="" style={{ width: '40px', height: '40px' }} /></td>
                                            <td>{p.name}</td>
                                            <td>₹{p.price}</td>
                                            <td>{p.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <button onClick={() => setViewingProducts(null)} className="action-btn" style={{ marginTop: '15px' }}>Close</button>
                    </div>
                </div>
            )}

            {viewingAllProducts && (
                <div className="modal-overlay" onClick={() => setViewingAllProducts(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 style={{ margin: 0 }}>All Sold Products</h2>
                            <button onClick={() => setViewingAllProducts(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#666' }}><FiXCircle /></button>
                        </div>
                        {analytics?.allProductSales?.length === 0 ? <p>No products sold yet.</p> : (
                            <table className="admin-table">
                                <thead><tr><th>Product Name</th><th>Units Sold</th><th>Revenue</th></tr></thead>
                                <tbody>
                                    {analytics?.allProductSales?.map((p, idx) => (
                                        <tr key={idx}>
                                            <td>{p.name}</td>
                                            <td>{p.qty}</td>
                                            <td>₹{p.revenue?.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '15px' }}>
                            <button className="action-btn" onClick={() => setViewingAllProducts(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Seller Details Modal */}
            {/* Seller Details Modal */}
            {sellerInView && (
                <div className="modal-overlay" onClick={() => setSellerInView(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2>Seller Application Details</h2>
                            <button onClick={() => setSellerInView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FiXCircle /></button>
                        </div>

                        <div className="seller-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div><strong>Business Name:</strong> <br /> {sellerInView.businessName}</div>
                            <div><strong>Email:</strong> <br /> {sellerInView.email}</div>
                            <div><strong>Phone:</strong> <br /> {sellerInView.phone}</div>
                            <div><strong>Status:</strong> <br /> <span className={`status-badge ${sellerInView.verificationStatus}`}>{sellerInView.verificationStatus}</span></div>

                            <div style={{ gridColumn: 'span 2', borderTop: '1px solid #eee', margin: '10px 0' }}></div>

                            <div><strong>PAN Number:</strong> <br /> {sellerInView.panNumber}</div>
                            <div><strong>GST Number:</strong> <br /> {sellerInView.gstNumber || 'N/A'}</div>

                            <div style={{ gridColumn: 'span 2', borderTop: '1px solid #eee', margin: '10px 0' }}></div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <strong>Bank Details:</strong> <br />
                                Account: {sellerInView.bankAccount?.accountNumber || 'N/A'} <br />
                                IFSC: {sellerInView.bankAccount?.ifscCode || 'N/A'} <br />
                                Bank: {sellerInView.bankAccount?.bankName || 'N/A'}
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <strong>Address:</strong> <br />
                                {sellerInView.address?.street}, {sellerInView.address?.city}, {sellerInView.address?.state} - {sellerInView.address?.zip}
                            </div>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            {sellerInView.verificationStatus === 'pending' && (
                                <>
                                    <button
                                        className="action-btn success"
                                        onClick={() => { handleApproveSeller(sellerInView._id); setSellerInView(null); }}
                                    >
                                        <FiCheckCircle /> Approve Application
                                    </button>
                                    <button
                                        className="action-btn danger"
                                        onClick={() => { handleBlockSeller(sellerInView._id); setSellerInView(null); }}
                                    >
                                        <FiXCircle /> Reject
                                    </button>
                                </>
                            )}
                            {sellerInView.verificationStatus === 'approved' && (
                                <button
                                    className="action-btn danger"
                                    onClick={() => { handleBlockSeller(sellerInView._id); setSellerInView(null); }}
                                >
                                    Block Seller
                                </button>
                            )}
                            <button className="action-btn" onClick={() => setSellerInView(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
