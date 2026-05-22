import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDeposits, manualTopUp } from '../../services/admin';

const ManualTopUp = () => {
    const [parents, setParents] = useState([]);
    const [selectedParent, setSelectedParent] = useState(null);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchParents();
        if (location.state?.parent) {
            setSelectedParent(location.state.parent);
        }
    }, []);

    const fetchParents = async () => {
        try {
            const res = await getDeposits();
            setParents(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredParents = parents.filter(p =>
        p.Name.toLowerCase().includes(search.toLowerCase()) ||
        p.MobileNum.includes(search)
    );

    const handleTopUp = async (e) => {
        e.preventDefault();
        if (!selectedParent) { setError('Please select a parent'); return; }
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await manualTopUp({
                parentID: selectedParent.PID,
                amount: parseFloat(amount),
                note
            });
            setSuccess(`Top up successful! New balance: ₹${res.data.newBalance}`);
            setAmount('');
            setNote('');
            fetchParents();
        } catch (err) {
            setError(err.response?.data?.message || 'Top up failed');
        } finally {
            setLoading(false);
        }
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
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
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
                        <h1>Manual Top Up</h1>
                        <p>Add wallet balance for cash payments</p>
                    </div>
                </div>

                <div className="admin-topup-layout">
                    {/* PARENT SELECTION */}
                    <div className="admin-card">
                        <h3>Select Parent</h3>
                        <input
                            type="text"
                            placeholder="Search parent..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="admin-search-input"
                        />
                        <div className="admin-parent-list">
                            {filteredParents.map((parent) => (
                                <div
                                    key={parent.PID}
                                    className={`admin-parent-item ${selectedParent?.PID === parent.PID ? 'active' : ''}`}
                                    onClick={() => setSelectedParent(parent)}
                                >
                                    <div>
                                        <p>{parent.Name}</p>
                                        <small>{parent.MobileNum}</small>
                                    </div>
                                    <span>&#8377;{parseFloat(parent.Balance).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TOP UP FORM */}
                    <div className="admin-card">
                        <h3>Top Up Details</h3>
                        {selectedParent && (
                            <div className="admin-selected-parent">
                                <p><strong>{selectedParent.Name}</strong></p>
                                <p>Current Balance: &#8377;{parseFloat(selectedParent.Balance).toFixed(2)}</p>
                            </div>
                        )}
                        <form onSubmit={handleTopUp}>
                            <div className="admin-input-group">
                                <label>Amount (&#8377;)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                            <div className="admin-input-group">
                                <label>Note (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Cash received at office"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                            {error && <p className="admin-error">{error}</p>}
                            {success && <p className="admin-success">{success}</p>}
                            <button type="submit" disabled={loading || !selectedParent}>
                                {loading ? 'Processing...' : 'Add Balance'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualTopUp;