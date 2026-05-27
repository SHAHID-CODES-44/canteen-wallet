import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'DB' },
        { name: 'Deposits', path: '/admin/deposits', icon: 'DP' },
        { name: 'Parents & Wards', path: '/admin/parents', icon: 'PW' },
        { name: 'Students List', path: '/admin/students', icon: 'ST' },
        { name: 'Manual Top Up', path: '/admin/topup', icon: 'TU' },
        { name: 'Sales Report', path: '/admin/sales', icon: 'SR' },
        { name: 'Menu Management', path: '/admin/menu', icon: 'MN' },
        { name: 'User Management', path: '/admin/users', icon: 'US' },
        { name: 'Data Import', path: '/admin/import', icon: 'IM' },
        { name: 'Barcode Generator', path: '/admin/barcodes', icon: 'BC' },
        { name: 'Add Parent', path: '/admin/add-parent', icon: 'AP' },
        { name: 'Add Student', path: '/admin/add-student', icon: 'AD' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <aside className="admin-sidebar-component">
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">CW</div>
                    <div>
                        <h3>CanteenWallet</h3>
                        <p>Admin Panel</p>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            type="button"
                            key={item.path}
                            className={`admin-sidebar-item ${currentPath === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-name">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-sidebar-user">
                        <div className="user-avatar">
                            {(storedUser?.name || 'Admin').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="user-name">{storedUser?.name || 'Admin'}</p>
                            <p className="user-role">Administrator</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="admin-logout-btn"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="admin-logout-backdrop" onClick={handleCancelLogout}>
                    <div className="admin-logout-modal" onClick={(e) => e.stopPropagation()}>
                        <span>Confirm Logout</span>
                        <h3>Logout from Admin Panel?</h3>
                        <p>
                            You will be returned to the home page and will need to sign in again
                            to access admin operations.
                        </p>

                        <div className="admin-logout-actions">
                            <button
                                type="button"
                                className="cancel-logout"
                                onClick={handleCancelLogout}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="confirm-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar;