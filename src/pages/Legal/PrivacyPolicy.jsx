
import React from 'react';
import './Legal.css';

const PrivacyPolicy = () => {
    return (
        <div className="legal-page container">
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last Updated: 20/02/2026</p>

            <section>
                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter. This includes your name, email address, shipping address, and payment information.</p>
            </section>

            <section>
                <h2>2. How We Use Your Information</h2>
                <p>We use your information to process your orders, communicate with you, and improve our services. We do not sell your personal information to third parties.</p>
            </section>

            <section>
                <h2>3. Cookies</h2>
                <p>We use cookies to enhance your shopping experience. You can choose to disable cookies in your browser settings, but this may affect potential functionality.</p>
            </section>

            <section>
                <h2>4. Data Security</h2>
                <p>We implement various security measures to maintain the safety of your personal information when you place an order or access your personal information.</p>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
