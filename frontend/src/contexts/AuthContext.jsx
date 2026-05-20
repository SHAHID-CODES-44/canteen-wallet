import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check token validity (not expired)
    const isTokenValid = (tokenStr) => {
        if (!tokenStr) return false;
        try {
            const payload = JSON.parse(atob(tokenStr.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    };
    // Load token from localStorage on app start
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        console.log('Loading stored token:', storedToken ? 'Yes' : 'No');

        if (storedToken && isTokenValid(storedToken) && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            console.log('Token restored successfully');
        } else {
            // Clear invalid/expired token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.log('No valid token found');
        }
        setLoading(false);
    }, []);

    const login = (tokenData, userData) => {
        localStorage.setItem('token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(tokenData);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);

        // Prevent back button from accessing protected pages
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout, isTokenValid }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);