import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { searchStudent } from '../../services/cashier';
import { useAuth } from '../../contexts/AuthContext';
import './StudentSearch.css';

const StudentSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [scanning, setScanning] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const scannerRef = useRef(null);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const station = JSON.parse(localStorage.getItem('station') || '{}');

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
            }
        };
    }, []);

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;
        setError('');
        setLoading(true);
        try {
            const res = await searchStudent(searchQuery);
            setResults(res.data);
        } catch (err) {
            setError('No student found');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const startScanner = () => {
        setScanning(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner('scanner-container', {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
            });
            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    setScanning(false);
                    setQuery(decodedText);
                    handleSearch(decodedText);
                },
                (err) => {}
            );
            scannerRef.current = scanner;
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(() => {});
        }
        setScanning(false);
    };

    const selectStudent = (student) => {
        localStorage.setItem('selectedStudent', JSON.stringify(student));
        navigate('/cashier/student');
    };

    const requestLogout = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    return (
        <div className="search-page">
            <div className="search-topbar">
                <div className="search-topbar-left">
                    <div className="search-logo">CW</div>
                    <div>
                        <p className="search-counter">{station?.name || 'Counter'}</p>
                        <p className="search-user">{user?.name}</p>
                    </div>
                </div>
                <div className="search-topbar-right">
                    <button className="search-summary-btn" onClick={() => navigate('/cashier/summary')}>
                        Day Summary
                    </button>
                    <button className="search-logout-btn" onClick={requestLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="search-content">
                <div className="search-title">
                    <span>Cashier Counter</span>
                    <h1>Find Student</h1>
                    <p>Scan barcode or search by student ID or name.</p>
                </div>

                <section className="search-action-card">
                    {scanning ? (
                        <div className="scanner-wrapper">
                            <div id="scanner-container"></div>
                            <button className="stop-scan-btn" onClick={stopScanner}>
                                Stop Scanning
                            </button>
                        </div>
                    ) : (
                        <button className="scan-btn" onClick={startScanner}>
                            Scan Barcode
                        </button>
                    )}

                    <div className="search-bar-wrapper">
                        <input
                            type="text"
                            placeholder="Type student ID or name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                            className="search-input"
                            autoFocus
                        />
                        <button
                            className="search-go-btn"
                            onClick={() => handleSearch(query)}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {error && <p className="search-error">{error}</p>}
                </section>

                {results.length > 0 && (
                    <div className="search-results">
                        <div className="search-results-heading">
                            <h2>Search Results</h2>
                            <p>Select a student to continue checkout.</p>
                        </div>

                        {results.map((student) => (
                            <div
                                key={student.SID}
                                className="search-result-card"
                                onClick={() => selectStudent(student)}
                            >
                                <div className="result-avatar">
                                    {student.Name.charAt(0)}
                                </div>
                                <div className="result-info">
                                    <h3>{student.Name}</h3>
                                    <p>{student.ClassName} - Division {student.DivName}</p>
                                    <p className="result-id">ID: {student.PermNum}</p>
                                </div>
                                <div className="result-balance">
                                    <p className="balance-label">Balance</p>
                                    <h3>&#8377;{parseFloat(student.Balance).toFixed(2)}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showLogoutConfirm && (
                <div className="cashier-logout-backdrop">
                    <div className="cashier-logout-modal">
                        <span>Confirm Logout</span>
                        <h3>Are you sure you want to logout?</h3>
                        <p>
                            You will leave the active cashier counter session and return to the home screen.
                        </p>
                        <div className="cashier-logout-actions">
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

export default StudentSearch;