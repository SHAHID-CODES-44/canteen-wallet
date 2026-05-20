import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { token, user, loading, isTokenValid } = useAuth();

    console.log('PrivateRoute - loading:', loading, 'token:', !!token, 'user:', !!user);

    // Wait for token check to complete
    if (loading) {
        console.log('PrivateRoute - still loading, showing spinner');
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                Loading...
            </div>
        );
    }

    // No token or token expired
    if (!token || !isTokenValid(token)) {
        console.log('PrivateRoute - no valid token, redirecting to home');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/" replace />;
    }

    // Role mismatch
    if (role && user?.role !== role) {
        console.log('PrivateRoute - role mismatch, redirecting');
        return <Navigate to="/" replace />;
    }

    console.log('PrivateRoute - access granted');
    return children;
};

export default PrivateRoute;