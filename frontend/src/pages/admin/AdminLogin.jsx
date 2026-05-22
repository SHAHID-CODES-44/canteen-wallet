import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminLogin } from '../../services/admin';
import "./Admin.css";

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await adminLogin({ username, password });
            if (res.data.role !== 'ADMIN') {
                setError('Access denied. Admin accounts only.');
                return;
            }
            login(res.data.token, {
                name: res.data.name,
                role: res.data.role
            });
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-logo">CW</div>
                    <h1>Admin Panel</h1>
                    <p>Sign in to manage CanteenWallet</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="admin-input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="admin-input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="admin-error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p onClick={() => navigate('/')}>&#8592; Back to Home</p>
            </div>
        </div>
    );
};

export default AdminLogin;