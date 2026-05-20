import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userLogin } from '../../services/auth';
import './CashierLogin.css';

const CashierLogin = () => {
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
            const res = await userLogin({ username, password });
            if (res.data.role !== 'CASHIER') {
                setError('Access denied. Cashier accounts only.');
                return;
            }
            login(res.data.token, {
                name: res.data.name,
                role: res.data.role
            });
            navigate('/cashier/station');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="cashier-login-page">
            <section className="cashier-login-shell">
                <div className="cashier-login-info">
                    <button className="cashier-home-link" type="button" onClick={() => navigate('/')}>
                        Back to Home
                    </button>

                    <div className="cashier-brand">
                        <span>CW</span>
                        <div>
                            <h2>CanteenWallet</h2>
                            <p>Cashier Counter Access</p>
                        </div>
                    </div>

                    <div className="cashier-hero-copy">
                        <span>Cash Desk Portal</span>
                        <h1>Fast checkout for busy school canteens.</h1>
                        <p>
                            Sign in to select your counter, search students, create orders,
                            and generate canteen coupons with wallet or cash payment mode.
                        </p>
                    </div>

                    <div className="cashier-info-grid">
                        <div>
                            <strong>Student Lookup</strong>
                            <p>Barcode, ID number, or name search.</p>
                        </div>
                        <div>
                            <strong>Coupon Checkout</strong>
                            <p>Quick cart, payment mode, and coupon issue.</p>
                        </div>
                    </div>
                </div>

                <div className="cashier-login-card">
                    <div className="cashier-login-header">
                        <div className="cashier-logo">CW</div>
                        <span>Staff Login</span>
                        <h1>Cashier Portal</h1>
                        <p>Use your assigned cashier credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="cashier-login-form">
                        <div className="cashier-input-group">
                            <label htmlFor="cashier-username">Username</label>
                            <input
                                id="cashier-username"
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="cashier-input-group">
                            <label htmlFor="cashier-password">Password</label>
                            <input
                                id="cashier-password"
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="cashier-error">{error}</p>}

                        <button type="submit" disabled={loading} className="cashier-login-btn">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default CashierLogin;