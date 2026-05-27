import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDaySummary } from '../../services/cashier';
import './DaySummary.css';

const DaySummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const station = JSON.parse(localStorage.getItem('station') || '{}');

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const res = await getDaySummary();
            setSummary(res.data);
        } catch (err) {
            setError('Failed to load summary');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="summary-loading">
            <div className="summary-spinner"></div>
            <p>Loading day summary...</p>
        </div>
    );

    if (error) return (
        <div className="summary-error">
            <p>{error}</p>
            <button onClick={fetchSummary}>Retry</button>
        </div>
    );

    return (
        <div className="day-summary-page">
            {/* Header */}
            <div className="summary-header">
                <button className="summary-back-btn" onClick={() => navigate('/cashier/search')}>
                    ← Back
                </button>
                <div className="summary-header-info">
                    <span className="summary-station">{station?.name || 'Counter 1'}</span>
                    <h1>Day Summary</h1>
                    <p>{new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}</p>
                </div>
                <div className="summary-placeholder"></div>
            </div>

            {/* Stats Grid */}
            <div className="summary-stats-grid">
                <div className="stat-card">
                    <div>
                        <span className="stat-label">Total Coupons</span>
                        <strong className="stat-value">{summary?.summary?.TotalCoupons || 0}</strong>
                    </div>
                </div>
                <div className="stat-card wallet">
                    <div>
                        <span className="stat-label">Wallet Sales</span>
                        <strong className="stat-value">₹{parseFloat(summary?.summary?.WalletTotal || 0).toFixed(2)}</strong>
                    </div>
                </div>
                <div className="stat-card cash">
                    <div>
                        <span className="stat-label">Cash Sales</span>
                        <strong className="stat-value">₹{parseFloat(summary?.summary?.CashTotal || 0).toFixed(2)}</strong>
                    </div>
                </div>
                <div className="stat-card total">
                    <div>
                        <span className="stat-label">Grand Total</span>
                        <strong className="stat-value">₹{parseFloat(summary?.summary?.GrandTotal || 0).toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            {/* Item Wise Sales Table */}
            <div className="summary-table-wrapper">
                <div className="table-header">
                    <h3>Item Wise Sales</h3>
                    <span className="record-count">{summary?.itemWise?.length || 0} items</span>
                </div>
                
                {summary?.itemWise?.length === 0 ? (
                    <div className="empty-state">
                        <p>No sales recorded today</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary?.itemWise?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.ItemName}</td>
                                        <td>{item.QuantitySold}</td>
                                        <td>₹{parseFloat(item.TotalRevenue).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="summary-footer">
                <button className="print-summary-btn" onClick={() => window.print()}>
                    Print Summary
                </button>
                <button className="refresh-summary-btn" onClick={fetchSummary}>
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default DaySummary;