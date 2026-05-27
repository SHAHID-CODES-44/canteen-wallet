import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import './OtpVerification.css';

const OtpVerification = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const pid = localStorage.getItem('pid');
            const res = await verifyOTP({ pid: parseInt(pid), otp });

            // ✅ FIX: Include pid in user object
            login(res.data.token, {
                name: res.data.name,
                role: res.data.role,
                pid: parseInt(pid)  // Add this line
            });

            localStorage.removeItem('pid');
            navigate('/parent/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="parent-auth-page">
            <section className="parent-auth-card">
                <button className="parent-back-link" type="button" onClick={() => navigate('/parent/login')}>
                    Back to Login
                </button>

                <div className="parent-auth-badge">OTP Verification</div>
                <h1>Verify your access</h1>
                <p>Enter the 6 digit OTP sent to your registered mobile and email.</p>

                <form className="parent-form" onSubmit={handleSubmit}>
                    <label htmlFor="otp">One Time Password</label>
                    <input
                        id="otp"
                        type="text"
                        placeholder="Enter 6 digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        required
                    />
                    {error && <p className="parent-error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            </section>
        </main>
    );
};

export default OtpVerification;