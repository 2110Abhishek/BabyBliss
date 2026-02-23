

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/Authcontext';
import { FiUploadCloud, FiCheckCircle, FiPackage, FiShoppingBag, FiTruck, FiBarChart2, FiGrid, FiDollarSign, FiLoader, FiXCircle } from 'react-icons/fi';
import './SellerPage.css';

const SellerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Dashboard Data State
    const [stats, setStats] = useState({ totalEarnings: 0, totalOrders: 0, totalProducts: 0, pendingOrders: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [products, setProducts] = useState([]);

    // Product Form State
    const [formData, setFormData] = useState({
        name: '', price: '', description: '', category: 'Clothing',
        image: '', images: [], tags: '', brand: '', stock: '1', sku: '', fulfillmentMethod: 'FBM',
        packQuantities: '' // Keep as fallback/simple input if needed, or remove
    });
    // Advanced Variant State
    const [productVariants, setProductVariants] = useState([]);
    const [newVariant, setNewVariant] = useState({ size: '', color: '', ageGroup: '', packQuantity: '', stock: 0 });
    const [editingProduct, setEditingProduct] = useState(null); // Track if editing
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Seller Verification State
    const [sellerStatus, setSellerStatus] = useState('loading'); // 'loading', 'approved', 'pending', 'blocked', 'none'

    useEffect(() => {
        if (user) {
            checkSellerStatus();
        }
    }, [user]);

    const checkSellerStatus = async () => {
        try {
            const res = await api.get(`/sellers/me?uid=${user.uid}`);
            if (res.data) {
                setSellerStatus(res.data.verificationStatus || 'pending');
            } else {
                setSellerStatus('none');
                navigate('/register-seller');
            }
        } catch (err) {
            console.error("Seller Status Error", err);
            // If 404, not a seller
            if (err.response && err.response.status === 404) {
                setSellerStatus('none');
                navigate('/register-seller');
            } else {
                setSellerStatus('error');
            }
        }
    };

    useEffect(() => {
        if (!user || sellerStatus !== 'approved') return;

        if (activeTab === 'overview') {
            fetchStats();
            fetchRecentOrders();
            fetchAnalytics(); // Fetch chart data
        } else if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'products') {
            fetchProducts();
        } else if (activeTab === 'analytics') { // New Tab
            fetchAnalytics();
        }
    }, [activeTab, user, sellerStatus]);

    if (sellerStatus === 'loading') return <div className="loading-screen"><FiLoader className="spin" /> Verifying Seller Account...</div>;

    if (sellerStatus === 'pending') {
        return (
            <div className="verification-pending-screen" style={{ textAlign: 'center', padding: '50px' }}>
                <FiCheckCircle size={60} color="#fca5a5" />
                <h2>Account Under Review</h2>
                <p>Your seller account is currently pending Admin Approval.</p>
                <p>Please check back later.</p>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px' }}>Go Home</button>
            </div>
        );
    }

    if (sellerStatus === 'blocked' || sellerStatus === 'rejected') {
        return (
            <div className="verification-blocked-screen" style={{ textAlign: 'center', padding: '50px' }}>
                <FiXCircle size={60} color="red" />
                <h2>Account Suspended</h2>
                <p>Your seller account has been suspended or rejected.</p>
                <p>Contact support for more information.</p>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px' }}>Go Home</button>
            </div>
        );
    }

    const fetchStats = async () => {
        try {
            const res = await api.get(`/seller/dashboard/stats?uid=${user.uid}`);
            setStats(res.data);
        } catch (err) { console.error("Stats Error", err); }
    };

    const fetchRecentOrders = async () => {
        try {
            const res = await api.get(`/seller/dashboard/recent-orders?uid=${user.uid}`);
            setRecentOrders(res.data);
        } catch (err) { console.error("Recent Orders Error", err); }
    };

    const fetchAnalytics = async () => {
        try {
            // Mock data if backend fails or returns empty (for demo purposes if no sales yet)
            // In real app, remove mock fallback. 
            const res = await api.get(`/seller/dashboard/analytics?uid=${user.uid}`);
            if (res.data.length > 0) {
                setAnalyticsData(res.data);
            } else {
                setAnalyticsData([]);
            }
        } catch (err) { console.error("Analytics Error", err); }
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get(`/seller/dashboard/products?uid=${user.uid}`);
            setProducts(res.data);
        } catch (err) { console.error("Products Error", err); }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await api.get(`/orders/seller/${user.uid}`);
            setOrders(res.data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleImageChange = (index, value) => {
        const updatedImages = [...formData.images];
        updatedImages[index] = value;
        setFormData({ ...formData, images: updatedImages });
    };

    const handleAddImage = () => {
        if (formData.images.length >= 5) return;
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const handleRemoveImage = (index) => {
        if (formData.images.length <= 1) return;
        const updatedImages = [...formData.images];
        updatedImages.splice(index, 1);
        setFormData({ ...formData, images: updatedImages });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (!user) return;

        try {
            const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];

            // Calculate total stock from variants if they exist
            const totalStock = productVariants.length > 0
                ? productVariants.reduce((sum, v) => sum + Number(v.stock), 0)
                : Number(formData.stock);

            // Derive simple arrays for backward compatibility / filters
            const derivedSizes = [...new Set(productVariants.map(v => v.size).filter(Boolean))];
            const derivedColors = [...new Set(productVariants.map(v => v.color).filter(Boolean))];
            const derivedAges = [...new Set(productVariants.map(v => v.ageGroup).filter(Boolean))];
            const derivedPacks = [...new Set(productVariants.map(v => v.packQuantity).filter(Boolean))];

            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: totalStock,
                tags: tagsArray,
                // Send specific variants
                variants: productVariants,
                // Send derived arrays
                sizes: derivedSizes,
                colors: derivedColors,
                ageGroups: derivedAges,
                packQuantities: derivedPacks,
                userId: user.uid,
                // Ensure at least one image if array is empty (fallback to legacy image field if user didn't use array)
                images: formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : [])
            };

            // Sync legacy image field for backward compat
            if (payload.images.length > 0) {
                payload.image = payload.images[0];
            }

            if (editingProduct) {
                // Update existing product
                await api.put(`/products/${editingProduct.id}`, payload);
                setSuccess(true); // "Product Updated!"
                setEditingProduct(null); // Exit edit mode
            } else {
                // Create new product
                await api.post('/products', payload);
                setSuccess(true); // "Product Listed!"
            }

            // Reset Form
            setFormData({
                name: '', price: '', description: '', category: 'Clothing',
                image: '', images: [], tags: '', brand: '', stock: '1', sku: '', fulfillmentMethod: 'FBM',
                packQuantities: ''
            });
            setProductVariants([]);
            setNewVariant({ size: '', color: '', ageGroup: '', packQuantity: '', stock: 0 });
            fetchProducts();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to save product.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            images: product.images && product.images.length > 0 ? product.images : [product.image],
            tags: product.tags ? product.tags.join(', ') : '',
            brand: product.brand || '',
            stock: product.stock,
            sku: product.sku || '',
            fulfillmentMethod: product.fulfillmentMethod || 'FBM',
            packQuantities: product.packQuantities ? product.packQuantities.join(', ') : ''
        });
        // Populate Variants
        if (product.variants && product.variants.length > 0) {
            setProductVariants(product.variants);
        } else {
            setProductVariants([]);
        }
        setActiveTab('products'); // Switch to form
        window.scrollTo(0, 0); // Scroll to top
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setEditingProduct(null);
        setFormData({
            name: '', price: '', description: '', category: 'Clothing',
            image: '', images: [], tags: '', brand: '', stock: '1', sku: '', fulfillmentMethod: 'FBM',
            packQuantities: ''
        });
        setProductVariants([]);
        setNewVariant({ size: '', color: '', ageGroup: '', packQuantity: '', stock: 0 });
    };

    // Helper: Add Variant
    const handleAddVariant = () => {
        if (!newVariant.stock || newVariant.stock < 0) return alert("Stock must be valid");
        // Basic validation: at least one attribute needed
        if (!newVariant.size && !newVariant.color && !newVariant.ageGroup && !newVariant.packQuantity) return alert("Select at least one attribute");

        setProductVariants([...productVariants, { ...newVariant, stock: Number(newVariant.stock) }]);
        setNewVariant({ size: '', color: '', ageGroup: '', packQuantity: '', stock: 0 }); // Reset
    };

    // Helper: Remove Variant
    const handleRemoveVariant = (index) => {
        const updated = [...productVariants];
        updated.splice(index, 1);
        setProductVariants(updated);
    };

    const handleMarkShipped = async (orderId) => {
        if (!window.confirm("Mark this order as Shipped?")) return;
        try {
            await api.put(`/orders/${orderId}/status`, {
                status: 'Shipped',
                location: 'Seller Warehouse',
                description: 'Seller has shipped the package'
            });
            alert("Order marked as Shipped!");
            fetchOrders();
            fetchStats(); // Update stats
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    };

    // Calculate max sales for chart scaling
    const maxSales = analyticsData.length > 0 ? Math.max(...analyticsData.map(d => d.sales)) : 100;

    return (
        <div className="seller-dashboard-content">
            <div className="seller-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><FiGrid /> Overview</button>
                <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}><FiPackage /> Products</button>
                <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}><FiShoppingBag /> Orders</button>
                <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><FiBarChart2 /> Analytics</button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="dashboard-overview">
                    <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        {/* Commission breakdown banner */}
                        <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.4rem' }}>💰</span>
                            <div>
                                <strong style={{ color: '#92400e' }}>Platform Commission: 10%</strong>
                                <span style={{ color: '#78350f', marginLeft: '12px', fontSize: '0.9rem' }}>
                                    You keep <strong>90%</strong> of every sale. BlissBloomly retains 10% as platform fee.
                                </span>
                            </div>
                        </div>

                        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#10b981', fontWeight: 'bold' }}>₹{(stats.netEarnings || 0).toLocaleString()}</div>
                            <div style={{ color: '#666' }}>Net Earnings (90%)</div>
                        </div>
                        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#ef4444', fontWeight: 'bold' }}>₹{(stats.commissionPaid || 0).toLocaleString()}</div>
                            <div style={{ color: '#666' }}>Commission Paid (10%)</div>
                        </div>
                        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#3b82f6', fontWeight: 'bold' }}>{stats.totalOrders}</div>
                            <div style={{ color: '#666' }}>Total Orders</div>
                        </div>
                        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#f59e0b', fontWeight: 'bold' }}>{stats.pendingOrders}</div>
                            <div style={{ color: '#666' }}>Pending Orders</div>
                        </div>
                        <div className="stat-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#6366f1', fontWeight: 'bold' }}>{stats.totalProducts}</div>
                            <div style={{ color: '#666' }}>Active Listings</div>
                        </div>
                    </div>


                    <div className="recent-activity" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <h3>Recent Orders</h3>
                        {recentOrders.length === 0 ? <p style={{ color: '#888', marginTop: '10px' }}>No recent orders.</p> : (
                            <div className="table-responsive">
                                <table className="admin-table" style={{ width: '100%', marginTop: '15px' }}>
                                    <thead><tr><th>Order ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {recentOrders.map(o => (
                                            <tr key={o._id}>
                                                <td>#{o._id.slice(-6)}</td>
                                                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                                <td>₹{o.total}</td>
                                                <td><span className={`status-badge ${o.status?.toLowerCase()}`}>{o.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <button onClick={() => setActiveTab('orders')} style={{ marginTop: '15px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>View All Orders</button>
                    </div>
                </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
                <div className="analytics-view" style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h2>Sales Analytics (Last 7 Days)</h2>
                    {analyticsData.length === 0 ? <p style={{ marginTop: '20px', color: '#666' }}>No sales data available for this period.</p> : (
                        <div className="chart-container" style={{ marginTop: '40px', height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                            {analyticsData.map((d, index) => (
                                <div key={index} style={{ textAlign: 'center', width: '10%' }}>
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(d.sales / maxSales) * 250}px`,
                                            background: '#3b82f6',
                                            marginBottom: '10px',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s ease',
                                            position: 'relative'
                                        }}
                                        title={`₹${d.sales}`}
                                    >
                                        <span style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 'bold' }}>₹{d.sales}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{d.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
                <div className="products-management">
                    {/* Add Product Form Toggle */}
                    <div className="toggle-add-product" style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <h3>Manage Inventory</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        {/* LEFT: Add/Edit Product Form */}
                        <div className="add-product-section">
                            <h4 style={{ marginBottom: '15px' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h4>
                            {success && <div className="success-banner" style={{ marginBottom: '15px', padding: '10px', background: '#d1fae5', color: '#065f46', borderRadius: '4px' }}>{editingProduct ? 'Product Updated!' : 'Product Listed!'}</div>}
                            <form onSubmit={handleSubmit} className="seller-form compact-form">
                                <div className="form-group"><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required /></div>
                                <div className="form-row">
                                    <div className="form-group"><label>Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} required /></div>
                                </div>
                                <div className="form-group">
                                    <label>Product Images (Min 1, Max 5)</label>
                                    {(formData.images.length > 0 ? formData.images : ['']).map((img, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                            <input
                                                type="url"
                                                name={`image-${index}`}
                                                value={img}
                                                onChange={(e) => {
                                                    const currentImages = formData.images.length > 0 ? [...formData.images] : [''];
                                                    currentImages[index] = e.target.value;
                                                    setFormData({ ...formData, images: currentImages });
                                                }}
                                                placeholder={`Image URL ${index + 1}`}
                                                required={index === 0} // Only first is required
                                                style={{ flex: 1 }}
                                            />
                                            {(formData.images.length > 1 || (formData.images.length === 1 && index === 0 && formData.images[0] !== '')) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const currentImages = formData.images.length > 0 ? [...formData.images] : [''];
                                                        if (currentImages.length <= 1) {
                                                            setFormData({ ...formData, images: [''] }); // Clear if last one
                                                        } else {
                                                            currentImages.splice(index, 1);
                                                            setFormData({ ...formData, images: currentImages });
                                                        }
                                                    }}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}
                                                    title="Remove Image"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {formData.images.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, images: [...(formData.images.length ? formData.images : ['']), ''] })}
                                            style={{ fontSize: '0.8rem', padding: '6px 12px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}
                                        >
                                            + Add Another Image
                                        </button>
                                    )}
                                </div>
                                <div className="form-group"><label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange}>
                                        <option>Clothing</option><option>Toys</option><option>Feeding</option><option>Bath & Care</option><option>Gear</option><option>Tech</option><option>Boys</option><option>Girls</option>
                                    </select>
                                </div>

                                {/* Conditional Variants Manager */}
                                {['Clothing', 'Boys', 'Girls', 'New Arrivals'].includes(formData.category) && (
                                    <div className="variant-manager" style={{ border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', marginBottom: '20px', background: '#f9fafb' }}>
                                        <h5 style={{ marginBottom: '10px', fontSize: '0.95rem', fontWeight: 'bold' }}>Manage Variants</h5>

                                        {/* Add Variant Inputs */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '15px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '3px' }}>Size</label>
                                                <input type="text" value={newVariant.size} onChange={e => setNewVariant({ ...newVariant, size: e.target.value })} placeholder="e.g. S" style={{ padding: '6px', width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '3px' }}>Color</label>
                                                <input type="text" value={newVariant.color} onChange={e => setNewVariant({ ...newVariant, color: e.target.value })} placeholder="e.g. Red" style={{ padding: '6px', width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '3px' }}>Age</label>
                                                <input type="text" value={newVariant.ageGroup} onChange={e => setNewVariant({ ...newVariant, ageGroup: e.target.value })} placeholder="e.g. 0-3 M" style={{ padding: '6px', width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '3px' }}>Stock</label>
                                                <input type="number" value={newVariant.stock} onChange={e => setNewVariant({ ...newVariant, stock: e.target.value })} min="0" style={{ padding: '6px', width: '100%' }} />
                                            </div>
                                            <button type="button" onClick={handleAddVariant} style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>Add</button>
                                        </div>

                                        {/* Variants List */}
                                        {productVariants.length > 0 && (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ background: '#eee', textAlign: 'left' }}>
                                                            <th style={{ padding: '5px' }}>Size</th>
                                                            <th style={{ padding: '5px' }}>Color</th>
                                                            <th style={{ padding: '5px' }}>Age</th>
                                                            <th style={{ padding: '5px' }}>Stock</th>
                                                            <th style={{ padding: '5px' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {productVariants.map((v, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                                                                <td style={{ padding: '5px' }}>{v.size || '-'}</td>
                                                                <td style={{ padding: '5px' }}>{v.color || '-'}</td>
                                                                <td style={{ padding: '5px' }}>{v.ageGroup || '-'}</td>
                                                                <td style={{ padding: '5px' }}>{v.stock}</td>
                                                                <td style={{ padding: '5px' }}>
                                                                    <button type="button" onClick={() => handleRemoveVariant(i)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>Total Stock: {productVariants.reduce((sum, v) => sum + Number(v.stock), 0)}</p>
                                    </div>
                                )}

                                <div className="form-group"><label>Pack Quantities (comma separated)</label><input type="text" name="packQuantities" value={formData.packQuantities} onChange={handleChange} placeholder="e.g. 1 Pack, Set of 2" /></div>
                                <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="2"></textarea></div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="submit-btn" disabled={loading}>{loading ? '...' : (editingProduct ? 'Update Product' : 'List Item')}</button>
                                    {editingProduct && <button type="button" onClick={handleCancelEdit} style={{ padding: '10px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>}
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: Product List */}
                        <div className="product-list-section" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <h4 style={{ marginBottom: '15px' }}>Your Listings ({products.length})</h4>
                            {products.length === 0 ? <p>No products listed.</p> : (
                                <div className="seller-product-list">
                                    {products.map(p => (
                                        <div key={p._id} className="seller-product-item" style={{ display: 'flex', gap: '10px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', marginBottom: '10px', background: '#fff' }}>
                                            <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                    ₹{p.price} | Stock: <strong>{p.stock}</strong>
                                                    {p.stock === 0 && <span style={{ marginLeft: '10px', color: 'white', background: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Out of Stock</span>}
                                                    {p.stock > 0 && p.stock < 5 && <span style={{ marginLeft: '10px', color: 'white', background: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>Low Stock</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleEditClick(p)}
                                                style={{ padding: '5px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: 'fit-content', alignSelf: 'center' }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="seller-orders-container">
                    <h2 style={{ marginBottom: '20px' }}>Order Management</h2>
                    {loadingOrders ? <p>Loading...</p> : orders.length === 0 ? <p>No orders found.</p> : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order._id} className="seller-order-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', background: 'white' }}>
                                    {/* ... Existing Order Card UI ... */}
                                    <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        <div>
                                            <strong>Order #{order._id.slice(-6)}</strong>
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`} style={{ padding: '5px 10px', borderRadius: '15px', background: '#eee', fontSize: '0.85em', height: 'fit-content' }}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>
                                    <div className="customer-info" style={{ marginBottom: '10px', fontSize: '0.9em', color: '#555' }}>
                                        <p><strong>Customer:</strong> {order.customer.name}</p>
                                        <p>{order.customer.address}, {order.customer.city}, {order.customer.zip}</p>
                                    </div>
                                    <div className="order-items">
                                        {/* Filter to show only items belonging to this seller */}
                                        {order.items.filter(item => item.sellerId === user.uid).map((item, idx) => (
                                            <div key={idx} className="order-item-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                                <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.9em' }}>Qty: {item.quantity} | {item.priceFormatted || `₹${item.price}`}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-footer" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                        {/* Per-order commission breakdown */}
                                        {(() => {
                                            const sellerItems = order.items.filter(item => item.sellerId === user.uid);
                                            const gross = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                            const commission = parseFloat((gross * 0.10).toFixed(2));
                                            const net = parseFloat((gross - commission).toFixed(2));
                                            return (
                                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', fontSize: '0.88rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                                                        <span>Gross Sale</span>
                                                        <span>₹{gross.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#ef4444' }}>
                                                        <span>🏪 BlissBloomly Fee (10%)</span>
                                                        <span>- ₹{commission}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#10b981', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '4px' }}>
                                                        <span>Your Earnings (90%)</span>
                                                        <span>₹{net}</span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            {(order.status === 'pending' || order.status === 'Processing') && (
                                                <button
                                                    className="ship-btn"
                                                    onClick={() => handleMarkShipped(order._id)}
                                                    style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <FiTruck /> Mark as Shipped
                                                </button>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <span style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}><FiCheckCircle /> Shipped</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
