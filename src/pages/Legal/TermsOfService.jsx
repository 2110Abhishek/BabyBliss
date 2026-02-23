
import React from 'react';
import './Legal.css';

const TermsOfService = () => {
    return (
        <div className="legal-page container">
            <h1>Terms of Service</h1>
            <p className="last-updated">Last Updated: 20/02/2026</p>

            <section>
                <h2>1. Introduction</h2>
                <p>Welcome to BlissBloomly. By accessing our website, you agree to these Terms of Service. Please read them carefully.</p>
            </section>

            <section>
                <h2>2. Use of Site</h2>
                <p>You may use our site for lawful purposes only. You must not use our site in any way that violates any applicable local, national, or international law or regulation.</p>
            </section>

            <section>
                <h2>3. Product Information</h2>
                <p>We try to be as accurate as possible with our product descriptions. However, we do not warrant that product descriptions or other content of this site is accurate, complete, reliable, current, or error-free.</p>
            </section>

            <section>
                <h2>4. Account Responsibilities</h2>
                <p>If you create an account, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.</p>
            </section>

            <section>
                <h2>5. Limitation of Liability</h2>
                <p>BlissBloomly shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.</p>
            </section>
        </div>
    );
};

export default TermsOfService;
