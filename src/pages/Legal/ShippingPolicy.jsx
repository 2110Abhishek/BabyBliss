
import React from 'react';
import './Legal.css';

const ShippingPolicy = () => {
    return (
        <div className="legal-page container">
            <h1>Shipping Policy</h1>
            <p className="last-updated">Last Updated: 20/02/2026</p>

            <section>
                <h2>1. Shipping Methods</h2>
                <p>We offer standard and express shipping options. Costs are calculated at checkout based on your location and the weight of your order.</p>
            </section>

            <section>
                <h2>2. Processing Time</h2>
                <p>Orders are typically processed within 1-2 business days. You will receive a confirmation email with tracking information once your order has shipped.</p>
            </section>

            <section>
                <h2>3. Domestic & International Shipping</h2>
                <p>We currently ship across India. International shipping is not available at this time.</p>
            </section>

            <section>
                <h2>4. Shipping Delays</h2>
                <p>While we strive to deliver on time, delays may occur due to unforeseen circumstances, holidays, or carrier issues. We appreciate your patience.</p>
            </section>
        </div>
    );
};

export default ShippingPolicy;
