import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../ProductCard/ProductCard';
import './Recommendations.css';
import { useAuth } from '../../context/Authcontext';
import { useSelector } from 'react-redux';

const Recommendations = ({ currentProductId, title = "Recommended For You", subtitle = "Based on your behavior and trends" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const cartItems = useSelector(state => state.cart.items || []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                // Extract unique categories from cart
                const cartCategories = [...new Set(cartItems.map(item => item.category).filter(Boolean))].join(',');

                // Build query params
                const params = new URLSearchParams();
                if (user && user.uid) params.append('uid', user.uid);
                if (cartCategories) params.append('cartCategories', cartCategories);
                if (currentProductId) params.append('currentProductId', currentProductId);

                const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/recommendations?${params.toString()}`);
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, cartItems, currentProductId]);

    if (loading) {
        return (
            <div className="recommendations-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null; // hide section if no recommendations exist
    }

    return (
        <section className="recommendations-section">
            <div className="container">
                <div className="section-header">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
                <div className="recommendations-grid">
                    {products.map(product => (
                        <ProductCard key={product._id || product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Recommendations;
