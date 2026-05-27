import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getLinkedStudents, setTransactionPin, checkHasPin } from '../../services/parent';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ParentNav from '../../components/ParentNav';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { isDark } = useTheme();

    // NEW: PIN related states
    const [hasPin, setHasPin] = useState(true);
    const [showSetPinModal, setShowSetPinModal] = useState(false);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [pinSuccess, setPinSuccess] = useState('');

    // Wait for auth to load token first
    useEffect(() => {
        if (!authLoading && user) {
            fetchAll();
            checkUserHasPin();
        }
    }, [authLoading, user]);

    // NEW: Check if user has transaction PIN
    const checkUserHasPin = async () => {
        try {
            const pid = user?.pid;
            if (pid) {
                const res = await checkHasPin({ pid });
                setHasPin(res.data.hasPin);
            }
        } catch (err) {
            console.error('Failed to check PIN status:', err);
        }
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('parentTheme');
        if (savedTheme) {
            setDarkMode(savedTheme === 'dark');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('parentTheme', darkMode ? 'dark' : 'light');
        if (darkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [darkMode]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [dashRes, studRes] = await Promise.all([
                getDashboard(),
                getLinkedStudents()
            ]);
            setDashboard(dashRes.data);
            setStudents(studRes.data);
            setError('');
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // NEW: Handle setting transaction PIN
    const handleSetPin = async () => {
        setPinError('');
        setPinSuccess('');

        if (!newPin || !confirmPin) {
            setPinError('Please enter PIN in both fields');
            return;
        }

        if (newPin.length < 4) {
            setPinError('PIN must be at least 4 digits');
            return;
        }

        if (newPin.length > 6) {
            setPinError('PIN must be at most 6 digits');
            return;
        }

        if (newPin !== confirmPin) {
            setPinError('PINs do not match');
            return;
        }

        try {
            const pid = user?.pid;
            await setTransactionPin({ pid, pin: newPin });
            setPinSuccess('Transaction PIN set successfully!');
            setHasPin(true);
            setTimeout(() => {
                setShowSetPinModal(false);
                setNewPin('');
                setConfirmPin('');
                setPinSuccess('');
            }, 1500);
        } catch (err) {
            setPinError(err.response?.data?.message || 'Failed to set PIN');
        }
    };

    // Show loading while auth is checking
    if (authLoading) {
        return (
            <div className="loader-screen">
                <div className="loader-spinner"></div>
                <p>Verifying your session...</p>
            </div>
        );
    }

    // If no user after auth loaded, redirect will happen in PrivateRoute
    if (!user) {
        return null;
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No purchases yet';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const todaySpending = students.reduce((sum, s) =>
        sum + parseFloat(s.TodaySpending || 0), 0
    );

    const isLowBalance = parseFloat(dashboard?.balance || 0) < 100;

    if (loading) return (
        <div className="loader-screen">
            <div className="loader-spinner"></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="error-screen">
            <p>{error}</p>
            <button onClick={fetchAll}>Try Again</button>
        </div>
    );

    return (
        <div className={`parent-page ${isDark ? 'dark' : 'light'}`}>       
            <ParentNav />

            {/* MAIN CONTENT */}
            <main className="dashboard-content">
                <div className="top-bar">
                    <div className="greeting-section">
                        <p className="greeting-text">{getGreeting()},</p>
                        <h2 className="greeting-name">{user?.name?.split(' ')[0]}</h2>
                        <span className="parent-context">Manage canteen balance and track spending</span>
                    </div>
                    <div className="avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                </div>

                {/* NEW: PIN not set warning */}
                {!hasPin && (
                    <div className="low-balance-alert animate-slide-down" style={{ borderLeftColor: '#4A90D9' }}>
                        <span>🔐 Set up your transaction PIN to enable secure top-ups.</span>
                        <button onClick={() => setShowSetPinModal(true)}>
                            Set PIN Now
                        </button>
                    </div>
                )}

                {isLowBalance && (
                    <div className="low-balance-alert animate-slide-down">
                        <span>⚠️ Low balance alert. Add funds to continue smooth canteen access.</span>
                        <button onClick={() => navigate('/parent/topup')}>
                            Top Up Now
                        </button>
                    </div>
                )}

                <div className="overview-grid">
                    <div className="wallet-card animate-fade-in">
                        <div className="wallet-card-top">
                            <div>
                                <p className="wallet-label">Total Wallet Balance</p>
                                <h1 className="wallet-balance">₹{parseFloat(dashboard?.balance || 0).toFixed(2)}</h1>
                                <p className="wallet-sub">
                                    Shared across {students.length} child{students.length !== 1 ? 'ren' : ''}
                                </p>
                            </div>
                            <div className="wallet-icon">₹</div>
                        </div>
                        <div className="wallet-card-bottom">
                            <button className="topup-btn" onClick={() => navigate('/parent/topup')}>
                                Top Up
                            </button>
                            <button className="history-btn" onClick={() => navigate('/parent/transactions')}>
                                 History
                            </button>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <p className="stat-label">Today's Spending</p>
                            <h3 className="stat-value">₹{todaySpending.toFixed(2)}</h3>
                        </div>
                        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <p className="stat-label">Linked Children</p>
                            <h3 className="stat-value">{students.length}</h3>
                        </div>
                        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <p className="stat-label">Total Transactions</p>
                            <h3 className="stat-value">{dashboard?.recentTransactions?.length || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="section quick-section">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions">
                        <div className="action-btn animate-scale" onClick={() => navigate('/parent/topup')}>
                            <span className="action-icon">+</span>
                            <p>Top Up</p>
                        </div>
                        <div className="action-btn animate-scale" onClick={() => navigate('/parent/transactions')}>
                            <span className="action-icon">H</span>
                            <p>History</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-columns">
                    <div className="section">
                        <div className="section-header">
                            <h3 className="section-title">My Children</h3>
                            <span className="view-all">View All</span>
                        </div>
                        {students.length === 0 ? (
                            <p className="empty-text">No students linked to your account</p>
                        ) : (
                            students.map((student, idx) => (
                                <div key={student.SID} className="student-card animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className="student-avatar">
                                        {student.Name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div className="student-info">
                                        <h4>{student.Name}</h4>
                                        <p>{student.ClassName} - Division {student.DivName}</p>
                                        <p className="student-last">
                                            Last purchase: {formatDate(student.LastPurchaseDate)}
                                            {student.LastPurchaseDate && ` at ${formatTime(student.LastPurchaseDate)}`}
                                        </p>
                                    </div>
                                    <div className="student-spending">
                                        <p className="spending-label">Today</p>
                                        <p className="spending-value">
                                            ₹{parseFloat(student.TodaySpending || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h3 className="section-title">Recent Transactions</h3>
                            <span className="view-all" onClick={() => navigate('/parent/transactions')}>
                                View All →
                            </span>
                        </div>
                        {dashboard?.recentTransactions?.length === 0 ? (
                            <p className="empty-text">No transactions yet</p>
                        ) : (
                            dashboard?.recentTransactions?.map((txn, idx) => (
                                <div key={txn.TID} className="txn-row animate-slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                                    <div className={`txn-icon ${txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? 'credit-icon' : 'debit-icon'}`}>
                                        {txn.Type === 'TOPUP' ? '↑' : txn.Type === 'ADJUSTMENT' ? '✓' : '↓'}
                                    </div>
                                    <div className="txn-info">
                                        <p className="txn-type">{txn.Type}</p>
                                        <small className="txn-date">
                                            {formatDate(txn.Date_Time)} • {formatTime(txn.Date_Time)}
                                        </small>
                                    </div>
                                    <div className="txn-amount">
                                        <p className={txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? 'credit' : 'debit'}>
                                            {txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? '+' : '-'}₹{parseFloat(txn.Amt).toFixed(2)}
                                        </p>
                                        <small>Balance: ₹{parseFloat(txn.Balance).toFixed(2)}</small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* NEW: Set PIN Modal */}
            {showSetPinModal && (
                <div className="pin-modal-overlay" onClick={() => setShowSetPinModal(false)}>
                    <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pin-modal-icon">🔐</div>
                        <h3>Set Transaction PIN</h3>
                        <p>Create a 4-6 digit PIN for secure top-ups</p>
                        <input
                            type="password"
                            placeholder="Enter PIN (4-6 digits)"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            maxLength={6}
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder="Confirm PIN"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            maxLength={6}
                            style={{ marginTop: '12px' }}
                        />
                        {pinError && <p className="pin-error">{pinError}</p>}
                        {pinSuccess && <p className="pin-success">{pinSuccess}</p>}
                        <div className="pin-modal-buttons">
                            <button className="pin-cancel" onClick={() => setShowSetPinModal(false)}>
                                Cancel
                            </button>
                            <button className="pin-confirm" onClick={handleSetPin}>
                                Set PIN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;