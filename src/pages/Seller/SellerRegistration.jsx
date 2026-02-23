import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/Authcontext';
import './SellerRegistration.css';
import { FiCheckCircle, FiBriefcase, FiCreditCard, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase/firebase';

const SellerRegistration = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Verification State
    const [isPanVerified, setIsPanVerified] = useState(false);
    const [panOtpSent, setPanOtpSent] = useState(false);
    const [panOtp, setPanOtp] = useState('');
    const [panOtpLoading, setPanOtpLoading] = useState(false);

    // Phone Verification State
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    const [formData, setFormData] = useState({
        businessName: '',
        email: '',
        phone: '',
        panNumber: '',
        gstNumber: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-wrapper', {
                size: 'invisible',
                callback: (response) => {
                    // reCAPTCHA solved
                }
            });
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- PAN Verification Logic (Simulated OTP) ---
    const handleSendPanOtp = async () => {
        if (!formData.panNumber || formData.panNumber.length !== 10) {
            setError("Invalid PAN format (e.g. ABCDE1234F)");
            toast.error("Invalid PAN format");
            return;
        }

        setError('');
        setPanOtpLoading(true);

        // Simulating API call to send OTP to linked mobile
        setTimeout(() => {
            try {
                setPanOtpLoading(false);
                setPanOtpSent(true);
                toast.success(`OTP sent to mobile linked with PAN ${formData.panNumber}`);
                toast('Use 123456 as OTP', { icon: '🔑' });
            } catch (e) {
                console.error(e);
                toast.error("Failed to send PAN OTP");
            }
        }, 1500);
    };

    const handleVerifyPanOtp = () => {
        setPanOtpLoading(true);
        setTimeout(() => {
            try {
                setPanOtpLoading(false);
                if (panOtp === '123456') {
                    setIsPanVerified(true);
                    setPanOtpSent(false); // Hide OTP field
                    toast.success("PAN Verification Successful!");
                } else {
                    toast.error("Invalid OTP");
                }
            } catch (e) {
                console.error(e);
                toast.error("Verification failed");
            }
        }, 1000);
    };

    // --- Phone Verification Logic (Firebase Free Tier) ---
    const handleSendPhoneOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) {
            setError("Invalid phone number");
            toast.error("Invalid phone number");
            return;
        }

        setError('');
        setPhoneOtpLoading(true);

        try {
            // Append +91 if not present for Indian numbers
            const phoneNumber = formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone;
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

            setConfirmationResult(confirmation);
            setPhoneOtpSent(true);
            toast.success(`OTP sent to ${phoneNumber}`);
        } catch (err) {
            console.error('Firebase OTP Error:', err);

            // Fallback for development if billing isn't enabled
            if (err.code === 'auth/billing-not-enabled' || err.message?.includes('billing')) {
                console.warn("Firebase billing not enabled. Falling back to test mode.");
                setConfirmationResult('simulated');
                setPhoneOtpSent(true);
                toast.success(`[TEST MODE] OTP '123456' sent to ${formData.phone}`);
            } else {
                setError(err.message || 'Error sending OTP');
                toast.error("Failed to send Phone OTP. Please try again.");
                if (window.recaptchaVerifier) {
                    window.recaptchaVerifier.render().then(widgetId => {
                        window.grecaptcha.reset(widgetId);
                    });
                }
            }
        } finally {
            setPhoneOtpLoading(false);
        }
    };

    const handleVerifyPhoneOtp = async () => {
        if (!phoneOtp) return;
        setPhoneOtpLoading(true);
        try {
            if (confirmationResult === 'simulated') {
                // Test mode verification
                if (phoneOtp === '123456') {
                    setIsPhoneVerified(true);
                    setPhoneOtpSent(false);
                    toast.success("Phone Number Verified Successfully (Test Mode)!");
                } else {
                    throw new Error("Invalid Test OTP. Try 123456.");
                }
            } else {
                // Real Firebase verification
                await confirmationResult.confirm(phoneOtp);
                setIsPhoneVerified(true);
                setPhoneOtpSent(false); // Hide OTP field
                toast.success("Phone Number Verified Successfully!");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Invalid Phone OTP");
            toast.error("Invalid OTP");
        } finally {
            setPhoneOtpLoading(false);
        }
    };


    const nextStep = () => {
        if (step === 1) {
            if (!formData.businessName || !formData.phone || !formData.email) {
                setError("Please fill in all business details.");
                toast.error("Please fill in all details");
                return;
            }
            if (!isPhoneVerified) {
                setError("Please verify your mobile number first.");
                toast.error("Please verify mobile number");
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) return;

        if (!isPanVerified) {
            setError("Please verify your PAN Card to submit.");
            toast.error("Please verify your PAN Card");
            setLoading(false);
            return;
        }

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(formData.panNumber)) {
            setError("Invalid PAN Card Format. Must be 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F).");
            toast.error("Invalid PAN Format");
            setLoading(false);
            return;
        }

        try {
            console.log('--- REGISTER SELLER DEBUG ---');
            console.log('User ID:', user?.uid);
            console.log('Email:', formData.email);
            console.log('Business Name:', formData.businessName);
            console.log('Phone:', formData.phone);
            console.log('PAN:', formData.panNumber);

            const payload = {
                userId: user.uid,
                email: formData.email,
                businessName: formData.businessName,
                phone: formData.phone,
                panNumber: formData.panNumber,
                gstNumber: formData.gstNumber,
                bankAccount: {
                    accountNumber: formData.accountNumber,
                    ifscCode: formData.ifscCode,
                    bankName: formData.bankName
                },
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: formData.country
                },
                isVerified: false // Admin approval required
            };

            console.log('Full Payload:', payload);
            await api.post('/sellers/register', payload);
            setSuccess(true);
            toast.success("Application Submitted! Waiting for Admin Approval.");
        } catch (err) {
            console.error(err);
            toast.error("Registration failed");
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="registration-success">
                <FiCheckCircle size={60} color="#fca5a5" /> {/* Use a different color/icon like clock or orange if possible, but keeping check is fine */}
                <h2>Application Under Review</h2>
                <p>Your details have been submitted.</p>
                <p>Please wait for Admin approval to access your dashboard.</p>
                <button onClick={() => navigate('/')}>Go to Home</button>
            </div>
        );
    }

    return (
        <div className="seller-registration-page">
            <div className="container">
                <div className="reg-header">
                    <h1>Register as a Seller</h1>
                    <div className="progress-bar">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Business</div>
                        <div className={`line ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Address</div>
                        <div className={`line ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Bank & Tax</div>
                    </div>
                </div>

                <div className="reg-form-container">
                    {error && <div className="error-banner">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: Business Info */}
                        {step === 1 && (
                            <div className="form-step">
                                <h3><FiBriefcase /> Business Details</h3>
                                {/* Commission Info Banner */}
                                <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>💰</span>
                                    <div>
                                        <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>Platform Commission Policy</strong>
                                        <span style={{ color: '#78350f', fontSize: '0.875rem' }}>BlissBloomly charges a <strong>10% platform fee</strong> on every sale. You receive <strong>90%</strong> of the sale price directly to your registered bank account.</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Business Name (Display Name)</label>
                                    <input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="e.g. BlissBloomly Retail" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={!!user?.email}
                                        placeholder="your@email.com"
                                    />
                                    {!!user?.email && <small style={{ color: 'green' }}>✓ Verified from Login</small>}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+91 9876543210"
                                            disabled={isPhoneVerified || phoneOtpSent}
                                            style={{ flex: 1 }}
                                        />
                                        {!isPhoneVerified && !phoneOtpSent && (
                                            <button
                                                type="button"
                                                onClick={handleSendPhoneOtp}
                                                disabled={phoneOtpLoading}
                                                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                {phoneOtpLoading ? 'Sending...' : 'Verify Phone'}
                                            </button>
                                        )}
                                        {isPhoneVerified && (
                                            <span style={{ color: 'green', display: 'flex', alignItems: 'center', fontWeight: 'bold', whiteSpace: 'nowrap' }}><FiCheckCircle /> Verified</span>
                                        )}
                                    </div>
                                    <div id="recaptcha-wrapper"></div>
                                </div>
                                {phoneOtpSent && !isPhoneVerified && (
                                    <div className="form-group" style={{ background: '#eefff5', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
                                        <label>Enter Phone Verification OTP</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={phoneOtp}
                                                onChange={(e) => setPhoneOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyPhoneOtp}
                                                disabled={phoneOtpLoading}
                                                style={{ background: '#28a745', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                {phoneOtpLoading ? 'Verifying...' : 'Submit OTP'}
                                            </button>
                                        </div>
                                        {confirmationResult === 'simulated' && (
                                            <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#10b981', fontWeight: '500' }}>
                                                [Test Mode] Use OTP: 123456
                                            </p>
                                        )}
                                    </div>
                                )}
                                <button type="button" className="next-btn" onClick={nextStep}>Next</button>
                            </div>
                        )}

                        {/* STEP 2: Address */}
                        {step === 2 && (
                            <div className="form-step">
                                <h3><FiMapPin /> Registered Business Address</h3>
                                {/* Commission Info Banner */}
                                <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>💰</span>
                                    <div>
                                        <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>Commission Reminder</strong>
                                        <span style={{ color: '#78350f', fontSize: '0.875rem' }}>Your payouts (90% of each sale) will be credited to the bank account you register at Step 3. BlissBloomly retains 10% as a platform service fee.</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Street Address</label>
                                    <input name="street" value={formData.street} onChange={handleChange} required />
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <label>City</label>
                                        <input name="city" value={formData.city} onChange={handleChange} required />
                                    </div>
                                    <div className="col">
                                        <label>State</label>
                                        <input name="state" value={formData.state} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <label>Zip Code</label>
                                        <input name="zip" value={formData.zip} onChange={handleChange} required />
                                    </div>
                                    <div className="col">
                                        <label>Country</label>
                                        <input name="country" value={formData.country} onChange={handleChange} disabled />
                                    </div>
                                </div>
                                <div className="btn-group">
                                    <button type="button" className="prev-btn" onClick={prevStep}>Back</button>
                                    <button type="button" className="next-btn" onClick={nextStep}>Next</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Bank & Tax */}
                        {step === 3 && (
                            <div className="form-step">
                                <h3><FiCreditCard /> Tax & Payout Details</h3>
                                {/* Commission Info Banner */}
                                <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>💰</span>
                                    <div>
                                        <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>Payout Structure — 90% to You, 10% to BlissBloomly</strong>
                                        <span style={{ color: '#78350f', fontSize: '0.875rem' }}>Your bank account below will receive <strong>90%</strong> of each sale automatically. Ensure your account details are correct for timely payouts.</span>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>PAN Number (Permanent Account Number)</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            name="panNumber"
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                            required
                                            placeholder="ABCDE1234F"
                                            disabled={isPanVerified || panOtpSent}
                                            style={{ flex: 1 }}
                                        />
                                        {!isPanVerified && !panOtpSent && (
                                            <button
                                                type="button"
                                                onClick={handleSendPanOtp}
                                                disabled={panOtpLoading}
                                                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                            >
                                                {panOtpLoading ? 'Sending...' : 'Send OTP'}
                                            </button>
                                        )}
                                        {isPanVerified && (
                                            <span style={{ color: 'green', display: 'flex', alignItems: 'center', fontWeight: 'bold', whiteSpace: 'nowrap' }}><FiCheckCircle /> Verified</span>
                                        )}
                                    </div>
                                </div>

                                {panOtpSent && !isPanVerified && (
                                    <div className="form-group" style={{ background: '#eefff5', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
                                        <label>Enter PAN Verification OTP</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={panOtp}
                                                onChange={(e) => setPanOtp(e.target.value)}
                                                placeholder="Enter 123456"
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleVerifyPanOtp}
                                                disabled={panOtpLoading}
                                                style={{ background: '#28a745', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                {panOtpLoading ? 'Verifying...' : 'Submit OTP'}
                                            </button>
                                        </div>
                                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>Use <b>123456</b> as test OTP.</small>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>GST Number (Optional for small sellers)</label>
                                    <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                                </div>
                                <hr />
                                <h4>Bank Account for Payouts</h4>
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <input name="bankName" value={formData.bankName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>IFSC Code</label>
                                    <input name="ifscCode" value={formData.ifscCode} onChange={handleChange} required />
                                </div>

                                <div className="btn-group">
                                    <button type="button" className="prev-btn" onClick={prevStep}>Back</button>
                                    <button type="submit" className="submit-btn" disabled={loading || !isPanVerified}>
                                        {loading ? 'Submitting...' : 'Submit Application'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div >
        </div >
    );
};

export default SellerRegistration;
