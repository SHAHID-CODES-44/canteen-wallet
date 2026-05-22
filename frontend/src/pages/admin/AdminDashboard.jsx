import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboard } from '../../services/admin';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await getAdminDashboard();
            setDashboard(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        logout();
        navigate('/');
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    if (loading) return <div className="admin-loading">Loading dashboard...</div>;

    return (
        <div className="admin-layout">
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="admin-modal-overlay" onClick={handleCancelLogout}>
                    <div className="admin-logout-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-icon">🚪</div>
                        <h3>Are you sure you want to logout?</h3>
                        <p>You will be taken back to the home screen and will need to login again to access the admin panel.</p>
                        <div className="admin-modal-actions">
                            <button type="button" className="admin-modal-cancel" onClick={handleCancelLogout}>
                                Cancel
                            </button>
                            <button type="button" className="admin-modal-confirm" onClick={handleConfirmLogout}>
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR */}
            <div className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">CW</div>
                    <div>
                        <h3>CanteenWallet</h3>
                        <p>Admin Panel</p>
                    </div>
                </div>
                <nav className="admin-nav">
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/dashboard')}>Dashboard</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/deposits')}>Deposits</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/sales')}>Sales Report</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/menu')}>Menu Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/users')}>User Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/import')}>Data Import</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/barcodes')}>Barcode Generator</div>
                </nav>
                <div className="admin-sidebar-footer">
                    <p>{user?.name}</p>
                    <button onClick={handleLogoutClick}>Logout</button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="admin-main">
                <div className="admin-page-header">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.name}</p>
                </div>

                {/* STATS */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <p>Total Parents</p>
                        <h2>{dashboard?.totalParents || 0}</h2>
                    </div>
                    <div className="admin-stat-card">
                        <p>Total Students</p>
                        <h2>{dashboard?.totalStudents || 0}</h2>
                    </div>
                    <div className="admin-stat-card green">
                        <p>Today's Sales</p>
                        <h2>₹{parseFloat(dashboard?.todaySales || 0).toFixed(2)}</h2>
                    </div>
                    <div className="admin-stat-card blue">
                        <p>Total Wallet Balance</p>
                        <h2>₹{parseFloat(dashboard?.totalBalance || 0).toFixed(2)}</h2>
                    </div>
                </div>

                {/* QUICK LINKS */}
                <div className="admin-quick-links">
                    <h3>Quick Actions</h3>
                    <div className="admin-quick-grid">
                        <div className="admin-quick-card" onClick={() => navigate('/admin/deposits')}>
                            <h4>Deposit Overview</h4>
                            <p>View all parent wallet balances</p>
                        </div>
                        <div className="admin-quick-card" onClick={() => navigate('/admin/topup')}>
                            <h4>Manual Top Up</h4>
                            <p>Add balance for cash payments</p>
                        </div>
                        <div className="admin-quick-card" onClick={() => navigate('/admin/sales')}>
                            <h4>Sales Report</h4>
                            <p>View today's sales and revenue</p>
                        </div>
                        <div className="admin-quick-card" onClick={() => navigate('/admin/barcodes')}>
                            <h4>Barcode Generator</h4>
                            <p>Generate student ID barcodes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;