import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const AuthContext = createContext(null);

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Convex mutations
    const loginMutation = useMutation(api.auth.login);
    const logoutMutation = useMutation(api.auth.logout);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Login function using Convex mutation
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const result = await loginMutation({ email, password });

            // The mutation now returns an object with { success, token, user, error }
            if (result && result.success) {
                // Store token and user
                localStorage.setItem(TOKEN_KEY, result.token);
                localStorage.setItem(USER_KEY, JSON.stringify(result.user));

                setToken(result.token);
                setUser(result.user);

                return { success: true, user: result.user };
            } else {
                const errorMessage = result?.error || 'Login failed. Please try again.';
                return { success: false, error: errorMessage };
            }
        } catch (error) {
            const errorMessage = error.message || 'Login failed. Please try again.';
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [loginMutation]);

    // Logout function
    const logout = useCallback(async () => {
        if (token) {
            try {
                await logoutMutation({ token });
            } catch {
                // Ignore errors on logout
            }
        }

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setToken(null);
        setUser(null);
        navigate('/login');
    }, [token, logoutMutation, navigate]);

    // Check if user has specific role
    const hasRole = useCallback((roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    }, [user]);

    // Check if user can access specific school
    const canAccessSchool = useCallback((schoolId) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        if (user.role === 'ANALYST') {
            return user.assignedSchools?.includes(schoolId);
        }
        if (user.role === 'PRINCIPAL') {
            return user.schoolId === schoolId;
        }
        return false;
    }, [user]);

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        canAccessSchool,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
