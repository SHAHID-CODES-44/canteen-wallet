import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topUp } from '../../services/parent';
import { useAuth } from '../../contexts/AuthContext';
import './TopUp.css';
import { useTheme } from '../../contexts/ThemeContext';
import ParentNav from '../../components/ParentNav';

const TopUp = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();

    const quickAmounts = [100, 200, 500, 1000];

    const handleTopUp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const amountValue = parseFloat(amount);
        if (!amountValue || amountValue <= 0) {
            setError('Please enter a valid amount');
            setLoading(false);
            return;
        }

        try {
            const res = await topUp(amountValue);
            setSuccess(`Top up successful! New balance: ₹${res.data.newBalance}`);
            setAmount('');
            setTimeout(() => navigate('/parent/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Top up failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`parent-page ${isDark ? 'dark' : 'light'}`}>
            <ParentNav />
            <div className="topup-page">
                <main className="topup-shell">
                    <header className="topup-header">
                        <div>
                            <p>Parent Wallet</p>
                            <h1>Top Up Wallet</h1>
                        </div>
                    </header>

                    <section className="topup-hero-card">
                        <div>
                            <span>Mock top-up</span>
                            <h2>Add canteen balance safely</h2>
                            <p>
                                This adds wallet balance in the system for cashless canteen purchases.
                                No real payment gateway is connected.
                            </p>
                        </div>
                        <div className="topup-hero-icon">₹</div>
                    </section>

                    <section className="topup-card">
                        <div className="topup-section-heading">
                            <h3>Choose Amount</h3>
                            <p>Select a quick amount or enter a custom value.</p>
                        </div>

                        <div className="quick-amounts">
                            {quickAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setAmount(amt.toString())}
                                    className={amount === amt.toString() ? 'active' : ''}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <form className="topup-form" onSubmit={handleTopUp}>
                            <label htmlFor="amount">Custom Amount</label>
                            <input
                                id="amount"
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="1"
                                required
                            />

                            {error && <p className="topup-error">{error}</p>}
                            {success && <p className="topup-success">{success}</p>}

                            <button type="submit" disabled={loading}>
                                {loading ? 'Processing...' : 'Top Up Now'}
                            </button>
                        </form>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default TopUp;