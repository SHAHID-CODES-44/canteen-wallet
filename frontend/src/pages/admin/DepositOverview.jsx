import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeposits } from '../../services/admin';

const DepositOverview = () => {
    const [deposits, setDeposits] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showLowOnly, setShowLowOnly] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchDeposits(); }, []);

    useEffect(() => {
        let data = [...deposits];
        if (search) {
            data = data.filter(p =>
                p.Name.toLowerCase().includes(search.toLowerCase()) ||
                p.MobileNum.includes(search)
            );
        }
        if (showLowOnly) {
            data = data.filter(p => parseFloat(p.Balance) < 100);
        }
        setFiltered(data);
    }, [deposits, search, showLowOnly]);

    const fetchDeposits = async () => {
        try {
            const res = await getDeposits();
            setDeposits(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        const headers = ['Name', 'Mobile', 'Email', 'Balance', 'Last Transaction'];
        const rows = filtered.map(p => [
            p.Name, p.MobileNum, p.EMailID,
            p.Balance,
            p.LastTransactionDate ? new Date(p.LastTransactionDate).toLocaleDateString() : 'Never'
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deposits.csv';
        a.click();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-layout">
            <div className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">CW</div>
                    <div><h3>CanteenWallet</h3><p>Admin Panel</p></div>
                </div>
                <nav className="admin-nav">
                    <div className="admin-nav-item" onClick={() => navigate('/admin/dashboard')}>Dashboard</div>
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/deposits')}>Deposits</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/sales')}>Sales Report</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/menu')}>Menu Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/users')}>User Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/import')}>Data Import</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/barcodes')}>Barcode Generator</div>
                </nav>
            </div>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Deposit Overview</h1>
                        <p>All parent wallet balances</p>
                    </div>
                    <button className="admin-export-btn" onClick={exportCSV}>Export CSV</button>
                </div>

                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Search by name or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="admin-search-input"
                    />
                    <label className="admin-checkbox">
                        <input
                            type="checkbox"
                            checked={showLowOnly}
                            onChange={(e) => setShowLowOnly(e.target.checked)}
                        />
                        Show Low Balance Only (below ₹100)
                    </label>
                </div>

                <div className="admin-table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Parent Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Balance</th>
                                <th>Last Transaction</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((parent) => (
                                <tr key={parent.PID}>
                                    <td>{parent.Name}</td>
                                    <td>{parent.MobileNum}</td>
                                    <td>{parent.EMailID}</td>
                                    <td className={parseFloat(parent.Balance) < 100 ? 'red-text' : 'green-text'}>
                                        &#8377;{parseFloat(parent.Balance).toFixed(2)}
                                    </td>
                                    <td>{parent.LastTransactionDate
                                        ? new Date(parent.LastTransactionDate).toLocaleDateString('en-IN')
                                        : 'Never'}
                                    </td>
                                    <td>
                                        <button
                                            className="admin-action-btn"
                                            onClick={() => navigate('/admin/topup', { state: { parent } })}
                                        >
                                            Top Up
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DepositOverview;