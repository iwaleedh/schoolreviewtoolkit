import { Component } from 'react';

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * Displays a fallback UI instead of crashing the entire app
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--color-surface, #f8fafc)',
                    borderRadius: '8px',
                    margin: '1rem',
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                    }}>
                        ⚠️
                    </div>
                    <h2 style={{
                        margin: '0 0 0.5rem 0',
                        color: 'var(--color-error, #dc2626)',
                    }}>
                        Something went wrong
                    </h2>
                    <p style={{
                        color: 'var(--color-text-secondary, #64748b)',
                        marginBottom: '1.5rem',
                    }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--color-primary, #4f46e5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        Try Again
                    </button>
                    {import.meta.env.DEV && this.state.errorInfo && (
                        <details style={{
                            marginTop: '1.5rem',
                            textAlign: 'left',
                            maxWidth: '100%',
                            overflow: 'auto',
                        }}>
                            <summary style={{ cursor: 'pointer', color: '#64748b' }}>
                                View Error Details
                            </summary>
                            <pre style={{
                                fontSize: '0.75rem',
                                overflow: 'auto',
                                backgroundColor: '#1e293b',
                                color: '#e2e8f0',
                                padding: '1rem',
                                borderRadius: '4px',
                                marginTop: '0.5rem',
                            }}>
                                {this.state.error?.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
