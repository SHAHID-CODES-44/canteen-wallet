import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentLogin } from '../../services/auth';
import './ParentLogin.css';

const ParentLogin = () => {
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await parentLogin({ mobile });
            localStorage.setItem('pid', res.data.pid);
            localStorage.setItem('parentName', res.data.name);
            navigate('/parent/otp');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="parent-auth-page">
            <section className="parent-auth-card">
                <button className="parent-back-link" type="button" onClick={() => navigate('/')}>
                    Back to Home
                </button>

                <div className="parent-auth-badge">Parent Portal</div>
                <h1>Login to CanteenWallet</h1>
                <p>Enter your registered mobile number to receive a secure OTP.</p>

                <form className="parent-form" onSubmit={handleSubmit}>
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                        id="mobile"
                        type="text"
                        placeholder="Enter mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
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