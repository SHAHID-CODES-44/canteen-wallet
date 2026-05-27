import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './ParentNav.css';

const ParentNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const navItems = [
        { name: 'Dashboard', label: 'Home', path: '/parent/dashboard', icon: 'DB' },
        { name: 'Transactions', label: 'History', path: '/parent/transactions', icon: 'TX' },
        { name: 'Top Up', label: 'Top Up', path: '/parent/topup', icon: '+' },
    ];

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const getInitial = () => {
        return (user?.name || 'Parent').charAt(0).toUpperCase();
    };

    return (
        <>
            <aside className={`parent-sidebar ${isDark ? 'dark' : 'light'}`}>
                <div className="parent-sidebar-header">
                    <div className="parent-logo">CW</div>
                    <div>
                        <h3>CanteenWallet</h3>
                        <p>Parent Portal</p>
                    </div>
                    <button
                        className="parent-theme-toggle"
                        onClick={toggleTheme}
                        title="Toggle theme"
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>
                </div>

                <nav className="parent-sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            type="button"
                            key={item.path}
                            className={`parent-sidebar-item ${currentPath === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="parent-nav-icon">{item.icon}</span>
                            <span>{item.name}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        className="parent-sidebar-item logout"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        <span className="parent-nav-icon">L</span>
                        <span>Logout</span>
                    </button>
                </nav>

                <div className="parent-sidebar-footer">
                    <div className="parent-user-info">
                        <div className="parent-user-avatar">{getInitial()}</div>
                        <div>
                            <p>{user?.name || 'Parent Account'}</p>
                            <span>Logged in</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAV */}
            <nav className={`parent-bottom-nav ${isDark ? 'dark' : 'light'}`}>
                {navItems.map((item) => (
                    <button
                        type="button"
                        key={item.path}
                        className={`parent-bottom-item ${currentPath === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="parent-bottom-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
                <button
                    type="button"
                    className="parent-bottom-item"
                    onClick={() => setShowLogoutConfirm(true)}
                >
                    <span className="parent-bottom-icon">L</span>
                    <span>Logout</span>
                </button>
                <button
                    type="button"
                    className="parent-bottom-item"
                    onClick={toggleTheme}
                >
                    <span className="parent-bottom-icon">{isDark ? '☀️' : '🌙'}</span>
                    <span>{isDark ? 'Light' : 'Dark'}</span>
                </button>
            </nav>

            {/* LOGOUT MODAL */}
            {showLogoutConfirm && (
                <div className={`parent-logout-overlay`} onClick={() => setShowLogoutConfirm(false)}>
                    <div className={`parent-logout-modal ${isDark ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
                        <span className="parent-logout-badge">Confirm Logout</span>
                        <h3>Logout from Parent Portal?</h3>
                        <p>You will return to the home page and need to login again.</p>
                        <div className="parent-logout-buttons">
                            <button
                                type="button"
                                className="parent-logout-cancel"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="parent-logout-confirm"
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

export default ParentNav;