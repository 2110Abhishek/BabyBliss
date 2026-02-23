
import React from 'react';
import './Legal.css';

const ReturnsPolicy = () => {
    return (
        <div className="legal-page container">
            <h1>Returns Policy</h1>
            <p className="last-updated">Last Updated: 20/02/2026</p>

            <section>
                <h2>1. Return Window</h2>
                <p>We accept returns within 7 days of delivery. Items must be unused, in their original packaging, and with all tags attached.</p>
            </section>

            <section>
                <h2>2. Non-Returnable Items</h2>
                <p>Certain items such as hygiene products, feeding accessories, and personalized items are non-returnable unless defective.</p>
            </section>

            <section>
                <h2>3. How to Initiate a Return</h2>
                <p>To initiate a return, please visit the "Orders" section in your account profile and select "Request Return" for the applicable item.</p>
            </section>

            <section>
                <h2>4. Refunds</h2>
                <p>Refunds will be processed to your original payment method within 5-7 business days after we receive and inspect your return.</p>
            </section>
        </div>
    );
};

export default ReturnsPolicy;
