import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentLogin } from '../../services/auth';
import './ParentLogin.css';

const ParentLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Send both fields - backend will figure out which one is provided
            const payload = {};
            if (identifier.includes('@')) {
                payload.email = identifier;
            } else {
                payload.mobile = identifier;
            }
            
            const res = await parentLogin(payload);
            localStorage.setItem('pid', res.data.pid);
            localStorage.setItem('parentName', res.data.name);
            navigate('/parent/otp');
        } catch (err) {
            setError(err.response?.data?.message || 'Parent not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="parent-auth-page">
            <section className="parent-auth-card">
                <button className="parent-back-link" type="button" onClick={() => navigate('/')}>
                    ← Back to Home
                </button>

                <div className="parent-auth-badge">Parent Portal</div>
                <h1>Login to CanteenWallet</h1>
                <p>Enter your registered mobile number OR email address to receive OTP.</p>

                <form className="parent-form" onSubmit={handleSubmit}>
                    <label htmlFor="identifier">Mobile Number or Email</label>
                    <input
                        id="identifier"
                        type="text"
                        placeholder="Enter mobile number or email address"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    {error && <p className="parent-error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default ParentLogin;