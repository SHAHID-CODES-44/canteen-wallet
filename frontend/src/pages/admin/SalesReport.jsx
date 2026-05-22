import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalesReport } from '../../services/admin';

const SalesReport = () => {
    const [sales, setSales] = useState(null);
    const [loading, setLoading] = useState(true);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchSales(); }, []);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const res = await getSalesReport(from, to);
            setSales(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!sales) return;
        const headers = ['Item', 'Qty Sold', 'Revenue'];
        const rows = sales.items.map(i => [i.ItemName, i.QuantitySold, i.TotalRevenue]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales_report.csv';
        a.click();
    };

    return (
        <div className="admin-layout">
            <div className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">CW</div>
                    <div><h3>CanteenWallet</h3><p>Admin Panel</p></div>
                </div>
                <nav className="admin-nav">
                    <div className="admin-nav-item" onClick={() => navigate('/admin/dashboard')}>Dashboard</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/deposits')}>Deposits</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/sales')}>Sales Report</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/menu')}>Menu Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/users')}>User Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/import')}>Data Import</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/barcodes')}>Barcode Generator</div>
                </nav>
            </div>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Sales Report</h1>
                        <p>Item wise sales and revenue</p>
                    </div>
                    <button className="admin-export-btn" onClick={exportCSV}>Export CSV</button>
                </div>

                <div className="admin-filters">
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                    <button className="admin-filter-btn" onClick={fetchSales}>Apply Filter</button>
                    <button className="admin-clear-btn" onClick={() => { setFrom(''); setTo(''); fetchSales(); }}>Clear</button>
                </div>

                {loading ? <div>Loading...</div> : (
                    <>
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card green">
                                <p>Grand Total</p>
                                <h2>&#8377;{parseFloat(sales?.grandTotal || 0).toFixed(2)}</h2>
                            </div>
                            <div className="admin-stat-card">
                                <p>Items Sold</p>
                                <h2>{sales?.items?.length || 0} types</h2>
                            </div>
                        </div>

                        <div className="admin-table-card">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Item Name</th>
                                        <th>Qty Sold</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales?.items?.length === 0 ? (
                                        <tr><td colSpan="4" style={{textAlign:'center'}}>No sales data found</td></tr>
                                    ) : (
                                        sales?.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.ItemName}</td>
                                                <td>{item.QuantitySold}</td>
                                                <td className="green-text">&#8377;{parseFloat(item.TotalRevenue).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SalesReport;