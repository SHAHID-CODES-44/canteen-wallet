import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { token, user } = useAuth();

    if (!token) {
        return <Navigate to="/" />;
    }

    if (role && user?.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;