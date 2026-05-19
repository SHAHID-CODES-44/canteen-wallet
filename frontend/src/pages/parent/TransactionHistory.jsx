import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions } from '../../services/parent';
import './TransactionHistory.css';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchTransactions(); }, []);
    useEffect(() => { applyFilters(); }, [transactions, filterType, dateRange]);

    const fetchTransactions = async () => {
        try {
            const res = await getTransactions();
            setTransactions(res.data);
            setFilteredTransactions(res.data);
        } catch (err) {
            setError('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...transactions];
        if (filterType !== 'ALL') {
            filtered = filtered.filter(txn => txn.Type === filterType);
        }
        if (dateRange.from) {
            filtered = filtered.filter(txn => new Date(txn.Date_Time) >= new Date(dateRange.from));
        }
        if (dateRange.to) {
            const toDate = new Date(dateRange.to);
            toDate.setHours(23, 59, 59);
            filtered = filtered.filter(txn => new Date(txn.Date_Time) <= toDate);
        }
        setFilteredTransactions(filtered);
    };

    const clearFilters = () => {
        setFilterType('ALL');
        setDateRange({ from: '', to: '' });
        setShowFilters(false);
    };

    const getTotalCredits = () => filteredTransactions
        .filter(txn => txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT')
        .reduce((sum, txn) => sum + parseFloat(txn.Amt), 0).toFixed(2);

    const getTotalDebits = () => filteredTransactions
        .filter(txn => txn.Type === 'PURCHASE')
        .reduce((sum, txn) => sum + parseFloat(txn.Amt), 0).toFixed(2);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit'
    });

    const getTypeLabel = (type) => {
        switch(type) {
            case 'TOPUP': return 'Wallet Top-up';
            case 'PURCHASE': return 'Canteen Purchase';
            case 'ADJUSTMENT': return 'Manual Adjustment';
            default: return type;
        }
    };

    const getTypeInitial = (type) => {
        switch(type) {
            case 'TOPUP': return 'T';
            case 'PURCHASE': return 'P';
            case 'ADJUSTMENT': return 'A';
            default: return '?';
        }
    };

    // Group transactions by date
    const groupByDate = () => {
        const groups = {};
        filteredTransactions.forEach(txn => {
            const date = formatDate(txn.Date_Time);
            if (!groups[date]) groups[date] = [];
            groups[date].push(txn);
        });
        return groups;
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Time', 'Type', 'Amount', 'Balance'];
        const csvData = filteredTransactions.map(txn => [
            formatDate(txn.Date_Time),
            formatTime(txn.Date_Time),
            getTypeLabel(txn.Type),
            txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? `+${txn.Amt}` : `-${txn.Amt}`,
            txn.Balance
        ]);
        const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const groupedTransactions = groupByDate();

    if (loading) return (
        <div className="txh-state-screen">
            <div className="txh-loader"></div>
            <p>Loading transactions...</p>
        </div>
    );

    if (error) return (
        <div className="txh-state-screen">
            <p className="txh-error">{error}</p>
            <button onClick={fetchTransactions} className="txh-retry-btn">Try Again</button>
        </div>
    );

    return (
        <div className="txh-page">
            <div className="txh-shell">

                {/* HEADER */}
                <header className="txh-header">
                    <button className="txh-back-btn" onClick={() => navigate('/parent/dashboard')}>
                        &#8592; Back
                    </button>
                    <div className="txh-header-title">
                        <span className="txh-label">Wallet Activity</span>
                        <h1>Transaction History</h1>
                    </div>
                    <div className="txh-header-actions">
                        <button
                            className={`txh-action-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Filter
                        </button>
                        <button
                            className="txh-action-btn"
                            onClick={exportToCSV}
                            disabled={filteredTransactions.length === 0}
                        >
                            Export CSV
                        </button>
                    </div>
                </header>

                {/* FILTERS */}
                {showFilters && (
                    <div className="txh-filters">
                        <div className="txh-filter-group">
                            <label>Transaction Type</label>
                            <div className="txh-filter-pills">
                                {['ALL', 'TOPUP', 'PURCHASE', 'ADJUSTMENT'].map(type => (
                                    <button
                                        key={type}
                                        className={filterType === type ? 'active' : ''}
                                        onClick={() => setFilterType(type)}
                                    >
                                        {type === 'ALL' ? 'All' : getTypeLabel(type)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="txh-filter-group">
                            <label>Date Range</label>
                            <div className="txh-date-range">
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                                />
                            </div>
                        </div>
                        <button className="txh-clear-btn" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* SUMMARY CARDS */}
                <div className="txh-summary-grid">
                    <div className="txh-summary-card">
                        <div className="txh-summary-icon neutral">
                            <span>&#9776;</span>
                        </div>
                        <div>
                            <p className="txh-summary-label">Total Records</p>
                            <h2>{filteredTransactions.length}</h2>
                        </div>
                    </div>
                    <div className="txh-summary-card">
                        <div className="txh-summary-icon credit">
                            <span>&#8593;</span>
                        </div>
                        <div>
                            <p className="txh-summary-label">Total Credits</p>
                            <h2 className="credit-text">&#8377;{getTotalCredits()}</h2>
                        </div>
                    </div>
                    <div className="txh-summary-card">
                        <div className="txh-summary-icon debit">
                            <span>&#8595;</span>
                        </div>
                        <div>
                            <p className="txh-summary-label">Total Debits</p>
                            <h2 className="debit-text">&#8377;{getTotalDebits()}</h2>
                        </div>
                    </div>
                </div>

                {/* TRANSACTIONS LIST GROUPED BY DATE */}
                <div className="txh-list-card">
                    <div className="txh-list-heading">
                        <h3>All Transactions</h3>
                        <p>{filteredTransactions.length} record{filteredTransactions.length !== 1 ? 's' : ''}</p>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <div className="txh-empty">
                            <div className="txh-empty-icon">&#8203;</div>
                            <p>No transactions found</p>
                            <button onClick={clearFilters} className="txh-empty-btn">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        Object.entries(groupedTransactions).map(([date, txns]) => (
                            <div key={date} className="txh-date-group">
                                <div className="txh-date-label">{date}</div>
                                {txns.map((txn, idx) => (
                                    <div
                                        key={txn.TID}
                                        className="txh-row"
                                        onClick={() => setSelectedTxn(txn)}
                                    >
                                        <div className={`txh-row-icon ${txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? 'credit-bg' : 'debit-bg'}`}>
                                            {getTypeInitial(txn.Type)}
                                        </div>
                                        <div className="txh-row-info">
                                            <p className="txh-row-type">{getTypeLabel(txn.Type)}</p>
                                            <small className="txh-row-time">{formatTime(txn.Date_Time)}</small>
                                            {txn.ReferenceID && (
                                                <small className="txh-row-ref">Ref: #{txn.ReferenceID}</small>
                                            )}
                                        </div>
                                        <div className="txh-row-amount">
                                            <p className={txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? 'credit-text' : 'debit-text'}>
                                                {txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT' ? '+' : '-'}&#8377;{parseFloat(txn.Amt).toFixed(2)}
                                            </p>
                                            <small>Bal: &#8377;{parseFloat(txn.Balance).toFixed(2)}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* FOOTER */}
                <div className="txh-footer">
                    <button className="txh-footer-btn" onClick={() => navigate('/parent/dashboard')}>
                        &#8592; Dashboard
                    </button>
                    <button className="txh-footer-btn primary" onClick={() => navigate('/parent/topup')}>
                        + Top Up Wallet
                    </button>
                </div>
            </div>

            {/* TRANSACTION DETAIL MODAL */}
            {selectedTxn && (
                <div className="txh-modal-overlay" onClick={() => setSelectedTxn(null)}>
                    <div className="txh-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="txh-modal-header">
                            <h3>Transaction Details</h3>
                            <button className="txh-modal-close" onClick={() => setSelectedTxn(null)}>
                                &#10005;
                            </button>
                        </div>
                        <div className="txh-modal-body">
                            <div className={`txh-modal-icon ${selectedTxn.Type === 'TOPUP' || selectedTxn.Type === 'ADJUSTMENT' ? 'credit-bg' : 'debit-bg'}`}>
                                {getTypeInitial(selectedTxn.Type)}
                            </div>
                            <p className="txh-modal-amount-label">{getTypeLabel(selectedTxn.Type)}</p>
                            <h2 className={`txh-modal-amount ${selectedTxn.Type === 'TOPUP' || selectedTxn.Type === 'ADJUSTMENT' ? 'credit-text' : 'debit-text'}`}>
                                {selectedTxn.Type === 'TOPUP' || selectedTxn.Type === 'ADJUSTMENT' ? '+' : '-'}&#8377;{parseFloat(selectedTxn.Amt).toFixed(2)}
                            </h2>
                            <div className="txh-modal-details">
                                <div className="txh-modal-row">
                                    <span>Transaction ID</span>
                                    <span>#{selectedTxn.TID}</span>
                                </div>
                                <div className="txh-modal-row">
                                    <span>Date</span>
                                    <span>{formatDate(selectedTxn.Date_Time)}</span>
                                </div>
                                <div className="txh-modal-row">
                                    <span>Time</span>
                                    <span>{formatTime(selectedTxn.Date_Time)}</span>
                                </div>
                                <div className="txh-modal-row">
                                    <span>Type</span>
                                    <span>{selectedTxn.Type}</span>
                                </div>
                                <div className="txh-modal-row">
                                    <span>Balance After</span>
                                    <span>&#8377;{parseFloat(selectedTxn.Balance).toFixed(2)}</span>
                                </div>
                                <div className="txh-modal-row">
                                    <span>Status</span>
                                    <span className="txh-status">{selectedTxn.Status}</span>
                                </div>
                                {selectedTxn.ReferenceID && (
                                    <div className="txh-modal-row">
                                        <span>Reference</span>
                                        <span>#{selectedTxn.ReferenceID}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="txh-modal-close-btn" onClick={() => setSelectedTxn(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;