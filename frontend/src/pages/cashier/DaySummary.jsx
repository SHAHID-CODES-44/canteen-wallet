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
        <div className="summary-loading">Loading day summary...</div>
    );

    if (error) return (
        <div className="summary-loading">{error}</div>
    );

    return (
        <div className="summary-page">
            <div className="summary-topbar">
                <button className="summary-back" onClick={() => navigate('/cashier/search')}>
                    &#8592; Back
                </button>
                <h2>Day Summary</h2>
                <div></div>
            </div>

            <div className="summary-content">
                <div className="summary-date">
                    <p>{station?.name || 'Counter'}</p>
                    <h3>{new Date().toLocaleDateString('en-IN', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}</h3>
                </div>

                {/* OVERVIEW CARDS */}
                <div className="summary-grid">
                    <div className="summary-card">
                        <p className="summary-card-label">Total Coupons</p>
                        <h2>{summary?.summary?.TotalCoupons || 0}</h2>
                    </div>
                    <div className="summary-card green-card">
                        <p className="summary-card-label">Wallet Total</p>
                        <h2>&#8377;{parseFloat(summary?.summary?.WalletTotal || 0).toFixed(2)}</h2>
                    </div>
                    <div className="summary-card blue-card">
                        <p className="summary-card-label">Cash Total</p>
                        <h2>&#8377;{parseFloat(summary?.summary?.CashTotal || 0).toFixed(2)}</h2>
                    </div>
                    <div className="summary-card dark-card">
                        <p className="summary-card-label">Grand Total</p>
                        <h2>&#8377;{parseFloat(summary?.summary?.GrandTotal || 0).toFixed(2)}</h2>
                    </div>
                </div>

                {/* ITEM WISE */}
                <div className="summary-table-card">
                    <h3 className="summary-table-title">Item Wise Sales</h3>
                    {summary?.itemWise?.length === 0 ? (
                        <p className="summary-empty">No sales recorded today</p>
                    ) : (
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary?.itemWise?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.ItemName}</td>
                                        <td>{item.QuantitySold}</td>
                                        <td>&#8377;{parseFloat(item.TotalRevenue).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DaySummary;