import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import '../Login.css';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const isValidToken = !!token;

    const applyReset = useMutation(api.auth.resetPasswordWithToken);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState(token ? 'idle' : 'error'); // idle, loading, success, error
    const [message, setMessage] = useState(token ? '' : 'Invalid reset link. Ensure you copied the entire URL.');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidToken) return;

        if (password.length < 8) {
            setStatus('error');
            setMessage('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await applyReset({
                token: token,
                newPassword: password
            });

            setStatus('success');
        } catch (error) {
            setStatus('error');
            // Provide a user-friendly message for expired/invalid tokens
            if (error.message.includes('expired') || error.message.includes('not found')) {
                setMessage('Your reset link has expired or is invalid. Please request a new one.');
            } else {
                setMessage(error.message || 'An error occurred while resetting your password.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <span className="sc-icon" aria-hidden="true">🔐</span>
                    <h1>Create New Password</h1>
                    <p className="subtitle">Secure your account by entering a new password below.</p>
                </div>

                {status === 'success' ? (
                    <div className="success-state" style={{ textAlign: 'center', margin: '2rem 0' }}>
                        <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-color)' }}>Password Reset Successful</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Your password has been securely updated. You can now log in with your new credentials.</p>

                        <button
                            className="submit-btn"
                            style={{ marginTop: '2rem' }}
                            onClick={() => navigate('/login')}
                        >
                            Log In Now
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
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 8 characters"
                                required
                                disabled={status === 'loading' || !isValidToken}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-type password"
                                required
                                disabled={status === 'loading' || !isValidToken}
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={status === 'loading' || !isValidToken}
                        >
                            {status === 'loading' ? 'Updating Password...' : 'Reset Password'}
                        </button>

                        {!isValidToken && (
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <button type="button" className="text-btn" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/forgot-password')}>
                                    Request a new link
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
