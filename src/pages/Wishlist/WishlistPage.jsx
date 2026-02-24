import React from 'react';
import { useAuth } from '../../context/Authcontext';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiHeart } from 'react-icons/fi';
import FullScreenLoader from '../../components/Loader/FullScreenLoader';
import './WishlistPage.css';

const WishlistPage = () => {
    const { wishlist, toggleWishlist, loading } = useAuth();
    const dispatch = useDispatch();

    const handleMoveToCart = (product) => {
        dispatch(addToCart({ ...product, quantity: 1 }));
        toggleWishlist(product); // Remove from wishlist
    };

    if (loading) {
        return <FullScreenLoader text="Loading Wishlist..." />;
    }

    return (
        <div className="wishlist-page">
            <div className="container" style={{ padding: '2rem', minHeight: '60vh' }}>
                <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiHeart fill="#e11d48" color="#e11d48" /> My Wishlist ({wishlist.length})
                </h1>

                {wishlist.length === 0 ? (
                    <div className="empty-wishlist" style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '10px' }}>
                        <FiHeart size={48} color="#ccc" />
                        <p style={{ marginTop: '1rem', color: '#666' }}>Your wishlist is empty.</p>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block', padding: '10px 20px', background: '#0ea5e9', color: 'white', borderRadius: '5px', textDecoration: 'none' }}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                        {wishlist.map(product => (
                            <div key={product._id} className="wishlist-card" style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', padding: '10px' }}>
                                <Link to={`/product/${product._id}`}>
                                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px' }} />
                                </Link>
                                <div className="p-details" style={{ padding: '10px 0' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '5px' }}>{product.name}</h3>
                                    <p style={{ fontWeight: 'bold', color: '#e11d48' }}>₹{product.price}</p>

                                    <div className="actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button
                                            onClick={() => handleMoveToCart(product)}
                                            style={{ flex: 1, padding: '8px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                        >
                                            <FiShoppingCart /> Move to Cart
                                        </button>
                                        <button
                                            onClick={() => toggleWishlist(product)}
                                            style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                            title="Remove"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
