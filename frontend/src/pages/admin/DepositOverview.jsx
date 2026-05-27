import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeposits } from '../../services/admin';
import AdminSidebar from '../../components/AdminSidebar';
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
            // Sort by LastTransactionDate - newest first
            const sortedData = [...res.data].sort((a, b) => {
                const dateA = a.LastTransactionDate ? new Date(a.LastTransactionDate) : new Date(0);
                const dateB = b.LastTransactionDate ? new Date(b.LastTransactionDate) : new Date(0);
                return dateB - dateA;
            });
            setDeposits(sortedData);
            setFiltered(sortedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        const headers = ['Last Transaction Date', 'Parent Name', 'Mobile', 'Email', 'Balance'];
        const rows = filtered.map(p => [
            p.LastTransactionDate ? new Date(p.LastTransactionDate).toLocaleDateString() : 'Never',
            p.Name, p.MobileNum, p.EMailID,
            p.Balance
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
           <AdminSidebar />
            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Deposit Overview</h1>
                        <p>All parent wallet balances - sorted by latest transaction</p>
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
                                <th>Last Transaction Date</th>
                                <th>Parent Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Balance</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((parent) => (
                                <tr key={parent.PID}>
                                    <td>
                                        {parent.LastTransactionDate
                                            ? new Date(parent.LastTransactionDate).toLocaleDateString('en-IN')
                                            : 'Never'}
                                    </td>
                                    <td>{parent.Name}</td>
                                    <td>{parent.MobileNum}</td>
                                    <td>{parent.EMailID}</td>
                                    <td className={parseFloat(parent.Balance) < 100 ? 'red-text' : 'green-text'}>
                                        ₹{parseFloat(parent.Balance).toFixed(2)}
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