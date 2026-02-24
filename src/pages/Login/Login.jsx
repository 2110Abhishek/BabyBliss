import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/Authcontext';
import { FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const from = location.state?.from || searchParams.get('redirect') || '/';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSignup, setIsSignup] = React.useState(false);
  const [error, setError] = React.useState(''); // General error state
  const [blockedReason, setBlockedReason] = React.useState('');
  const [requestSent, setRequestSent] = React.useState(false);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert('Google Login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first to reset password.");
      return;
    }
    try {
      await resetPassword(email);
      alert("Password reset email sent! Check your 👉 SPAM FOLDER 👈.");
    } catch (error) {
      alert("Error sending reset email: " + error.message);
    }
  };

  const handleRequestUnblock = async () => {
    if (!blockedReason) {
      alert("Please provide a reason.");
      return;
    }
    try {
      const response = await fetch('https://blissbloomlybackend.onrender.com/api/users/request-unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: blockedReason })
      });

      const data = await response.json();
      if (response.ok) {
        setRequestSent(true);
        alert("Request sent to Admin.");
      } else {
        alert(data.message || "Failed to send request");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending request");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }
        if (password.length < 6) {
          alert("Password should be at least 6 characters.");
          return;
        }
        await signupWithEmail(email, password, name);
        // FORCE LOGOUT after signup so they can't access app without verification
        await logout();
        alert("Signup Success! Verification email sent. Please verify your email in your 👉 SPAM FOLDER 👈, then login.");
        setIsSignup(false); // Switch back to login mode
      } else {
        const userCredential = await loginWithEmail(email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          await logout(); // Kick them out
          alert("Email Not Verified. Please check your spam folder and verify your email.");
          return; // Do not navigate
        }
        // If verified, proceed
      }
      if (!isSignup) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      let msg = err.message;
      let isKnownError = false;

      if (err.code === 'auth/email-already-in-use') {
        msg = "This email is already registered. Please login instead.";
        isKnownError = true;
      } else if (err.code === 'auth/wrong-password') {
        msg = "Incorrect password.";
        isKnownError = true;
      } else if (err.code === 'auth/user-not-found') {
        msg = "No account found with this email.";
        isKnownError = true;
      } else if (err.code === 'auth/user-disabled') {
        setError("Your account has been blocked.");
        return;
      } else if (err.code === 'auth/invalid-credential') {
        msg = "Invalid email or password. Don't have an account? Please create an account then login.";
        isKnownError = true;
      }

      // Only log unexpected errors to the console
      if (!isKnownError) {
        console.error("Auth Error:", err);
      }

      alert(`Error: ${msg}`);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome to BlissBloomly</h1>

        {/* Blocked User Message */}
        {error && error.includes('blocked') ? (
          <div className="blocked-message">
            <h2>🚫 Account Blocked</h2>
            <p>Your account has been disabled by the administrator.</p>
            <div className="contact-admin-section">
              <p>If you believe this is a mistake, you can appeal:</p>
              <textarea
                className="login-input"
                placeholder="Reason for unblocking..."
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                rows="3"
              ></textarea>
              <button className="login-btn warning" onClick={handleRequestUnblock} disabled={requestSent}>
                {requestSent ? 'Request Sent' : 'Contact Admin'}
              </button>
              <button className="text-btn" onClick={() => { setError(''); setBlockedReason(''); }}>
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <p>{isSignup ? 'Create an account to continue' : 'Please login to continue'}</p>

            <form onSubmit={handleSubmit} className="login-form">
              {isSignup && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="login-input"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
              />

              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {isSignup && (
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="login-input"
                  />
                </div>
              )}

              {!isSignup && (
                <div className="forgot-password-link" onClick={handleForgotPassword}>
                  Forgot Password?
                </div>
              )}

              <button
                type="submit"
                className="login-btn"
              >
                {isSignup ? 'Sign Up' : 'Login'}
              </button>
            </form>

            <div className="divider">OR</div>

            <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
              <FiLogIn /> Login with Google
            </button>

            <p className="toggle-auth">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? 'Login' : 'Sign Up'}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
