import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import '../Login.css'; // Reuse login styling

function ForgotPassword() {
    const navigate = useNavigate();
    const requestReset = useMutation(api.auth.requestPasswordReset);

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [mockTokenLink, setMockTokenLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setStatus('error');
            setMessage('Please enter your email address.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const result = await requestReset({ email: email.trim() });
            setStatus('success');
            setMessage(result.message);

            // For development, we extract the mockToken to render it for the admin/user
            if (result.mockToken) {
                const currentOrigin = window.location.origin;
                // e.g. /school-review-toolkit for github pages, or / for netlify
                const basename = import.meta.env.VITE_ROUTER_BASENAME || '/';
                const formattedBasename = basename.endsWith('/') ? basename.slice(0, -1) : basename;

                setMockTokenLink(`${currentOrigin}${formattedBasename}/reset-password?token=${result.mockToken}`);
            }

        } catch (error) {
            setStatus('error');
            setMessage('An error occurred while attempting to process your request.');
            console.error(error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <span className="sc-icon" aria-hidden="true">🏫</span>
                    <h1>Reset Password</h1>
                    <p className="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                {status === 'success' ? (
                    <div className="success-state" style={{ textAlign: 'center', margin: '2rem 0' }}>
                        <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>Check your email</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{message}</p>

                        {mockTokenLink && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ca8a04', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    <ShieldAlert size={18} /> Development Mode Notice
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>
                                    Emails are not actively being sent across the network. Click the link below to continue the reset flow:
                                </p>
                                <a href={mockTokenLink} style={{ wordBreak: 'break-all', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                    {mockTokenLink}
                                </a>
                            </div>
                        )}

                        <button
                            className="submit-btn"
                            style={{ marginTop: '2rem' }}
                            onClick={() => navigate('/login')}
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        {status === 'error' && (
                            <div className="error-message" role="alert">
                                {message}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@school.edu.mv"
                                required
                                disabled={status === 'loading'}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
                        </button>

                        <div className="back-link-container" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <Link to="/login" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
