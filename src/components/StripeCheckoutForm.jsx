import { auth } from '../firebase/firebase';

const StripeCheckoutForm = ({ clientSecret, totalAmount }) => {
    // ... hooks ...

    const saveOrderToBackend = async (transactionId, paymentType) => {
        try {
            const currentUser = auth.currentUser;
            const uid = currentUser ? currentUser.uid : null;

            const orderData = {
                items: items.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    priceFormatted: convertAdjustAndFormat(item.price),
                    quantity: item.quantity,
                    image: item.image
                })),
                subtotal: total.toFixed(2),
                shipping: shipping,
                total: totalAmount.toFixed(2),
                totalFormatted: convertAdjustAndFormat(totalAmount),
                customer: shippingAddress,
                paymentMethod: paymentType || 'card', // 'card', 'upi', etc. from Stripe
                paymentStatus: 'completed',
                transactionId: transactionId,
                firebaseUid: uid
            };

            const response = await axios.post('https://blissbloomlybackend.onrender.com/api/orders', orderData);

            if (response.status === 201) {
                dispatch(clearCart());
                navigate('/order-success', { state: { orderId: response.data._id } });
            }
        } catch (err) {
            console.error("Failed to save order", err);
            setError("Payment succeeded but order creation failed. Please contact support.");
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <div className="form-row" style={{ marginBottom: '20px' }}>
                {/* PaymentElement loads all enabled methods (Card, UPI, etc) */}
                <PaymentElement />
            </div>

            {error && <div className="card-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
            >
                {processing ? "Processing..." : `Pay ${convertAdjustAndFormat(totalAmount)}`}
            </button>

            <p style={{ fontSize: '12px', marginTop: '10px', textAlign: 'center', color: '#555' }}>
                Secured by Stripe
            </p>
        </form>
    );
};

export default StripeCheckoutForm;
