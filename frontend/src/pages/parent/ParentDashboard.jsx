import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getLinkedStudents } from '../../services/parent';
import { useAuth } from '../../contexts/AuthContext';
import './ParentDashboard.css';

const ParentDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeNav, setActiveNav] = useState('home');
    const [darkMode, setDarkMode] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();

    // Wait for auth to load token first
    useEffect(() => {
        if (!authLoading && user) {
            console.log('Auth loaded, fetching dashboard data...');
            fetchAll();
        }
    }, [authLoading, user]);

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
        console.log('fetchAll called');
        setLoading(true);
        try {
            const [dashRes, studRes] = await Promise.all([
                getDashboard(),
                getLinkedStudents()
            ]);
            console.log('Dashboard response:', dashRes);
            console.log('Students response:', studRes);
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

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/', { replace: true });
    };

    const requestLogout = () => {
        setShowLogoutConfirm(true);
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

    const getInitials = (name) => {
        if (!name) return 'P';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

    const navigateWithTransition = (path) => {
        document.body.classList.add('page-transition');
        setTimeout(() => {
            navigate(path);
            setTimeout(() => {
                document.body.classList.remove('page-transition');
            }, 100);
        }, 200);
    };

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
        <div className={`parent-app ${darkMode ? 'dark' : ''}`}>
            {/* Rest of your JSX remains the same */}
            <button 
                className="theme-toggle" 
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
            >
                {darkMode ? 'Light' : 'Dark'}
            </button>

            <aside className="desktop-sidebar">
                <div className="sidebar-brand">
                    <span className="brand-icon">CW</span>
                    <div>
                        <h3>CanteenWallet</h3>
                        <p>Parent Portal</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={activeNav === 'home' ? 'active' : ''}
                        onClick={() => setActiveNav('home')}
                    >
                        <span className="nav-icon">D</span>
                        Dashboard
                    </button>
                    <button
                        className={activeNav === 'transactions' ? 'active' : ''}
                        onClick={() => { 
                            setActiveNav('transactions'); 
                            navigateWithTransition('/parent/transactions');
                        }}
                    >
                        <span className="nav-icon">T</span>
                        Transactions
                    </button>
                    <button
                        className={activeNav === 'topup' ? 'active' : ''}
                        onClick={() => { 
                            setActiveNav('topup'); 
                            navigateWithTransition('/parent/topup');
                        }}
                    >
                        <span className="nav-icon">+</span>
                        Top Up Wallet
                    </button>
                    <button onClick={requestLogout}>
                        <span className="nav-icon">L</span>
                        Logout
                    </button>
                </nav>

                <div className="sidebar-note">
                    <strong>Parent Wallet</strong>
                    <p>One balance shared across all linked children. Top up once, use everywhere.</p>
                </div>
            </aside>

            <main className="dashboard-content">
                <div className="top-bar">
                    <div className="greeting-section">
                        <p className="greeting-text">{getGreeting()},</p>
                        <h2 className="greeting-name">{user?.name?.split(' ')[0]}</h2>
                        <span className="parent-context">Manage canteen balance and track spending</span>
                    </div>
                    <div className="avatar" onClick={requestLogout}>
                        {getInitials(user?.name)}
                    </div>
                </div>

                {isLowBalance && (
                    <div className="low-balance-alert animate-slide-down">
                        <span>Low balance alert. Add funds to continue smooth canteen access.</span>
                        <button onClick={() => navigateWithTransition('/parent/topup')}>
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
                            <button className="topup-btn" onClick={() => navigateWithTransition('/parent/topup')}>
                                Top Up
                            </button>
                            <button className="history-btn" onClick={() => navigateWithTransition('/parent/transactions')}>
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
                        <div className="action-btn animate-scale" onClick={() => navigateWithTransition('/parent/topup')}>
                            <span className="action-icon">+</span>
                            <p>Top Up</p>
                        </div>
                        <div className="action-btn animate-scale" onClick={() => navigateWithTransition('/parent/transactions')}>
                            <span className="action-icon">H</span>
                            <p>History</p>
                        </div>
                        <div className="action-btn animate-scale">
                            <span className="action-icon">S</span>
                            <p>Statement</p>
                        </div>
                        <div className="action-btn animate-scale">
                            <span className="action-icon">?</span>
                            <p>Support</p>
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
                                        {getInitials(student.Name)}
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
                            <span className="view-all" onClick={() => navigateWithTransition('/parent/transactions')}>
                                View All
                            </span>
                        </div>
                        {dashboard?.recentTransactions?.length === 0 ? (
                            <p className="empty-text">No transactions yet</p>
                        ) : (
                            dashboard?.recentTransactions?.map((txn, idx) => (
                                <div key={txn.TID} className="txn-row animate-slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
                                    <div className={`txn-icon ${txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? 'credit-icon' : 'debit-icon'}`}>
                                        {txn.Type === 'TOPUP' ? 'T' : txn.Type === 'ADJUSTMENT' ? 'A' : 'P'}
                                    </div>
                                    <div className="txn-info">
                                        <p className="txn-type">{txn.Type}</p>
                                        <small className="txn-date">
                                            {formatDate(txn.Date_Time)} - {formatTime(txn.Date_Time)}
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

            <div className="bottom-nav">
                <div className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveNav('home')}>
                    <span>H</span>
                    <p>Home</p>
                </div>
                <div className={`nav-item ${activeNav === 'transactions' ? 'active' : ''}`}
                    onClick={() => { 
                        setActiveNav('transactions'); 
                        navigateWithTransition('/parent/transactions');
                    }}>
                    <span>T</span>
                    <p>History</p>
                </div>
                <div className={`nav-item ${activeNav === 'topup' ? 'active' : ''}`}
                    onClick={() => { 
                        setActiveNav('topup'); 
                        navigateWithTransition('/parent/topup');
                    }}>
                    <span>+</span>
                    <p>Top Up</p>
                </div>
                <div className="nav-item" onClick={requestLogout}>
                    <span>L</span>
                    <p>Logout</p>
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="logout-modal-backdrop">
                    <div className="logout-modal">
                        <span className="logout-modal-badge">Confirm Logout</span>
                        <h3>Are you sure you want to logout?</h3>
                        <p>
                            You will be taken back to the home screen and will need to login again
                            to access the parent portal.
                        </p>

                        <div className="logout-modal-actions">
                            <button type="button" className="cancel-logout" onClick={() => setShowLogoutConfirm(false)}>
                                Cancel
                            </button>
                            <button type="button" className="confirm-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;