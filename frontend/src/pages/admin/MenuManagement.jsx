import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu, addMenuItem, updateMenuItem, updateMenuStatus } from '../../services/admin';

const MenuManagement = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', rate: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchMenu(); }, []);

    const fetchMenu = async () => {
        try {
            const res = await getMenu();
            setMenu(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (editItem) {
                await updateMenuItem(editItem.ItemID, { name: form.name, rate: parseFloat(form.rate) });
                setSuccess('Item updated successfully');
            } else {
                await addMenuItem({ name: form.name, rate: parseFloat(form.rate) });
                setSuccess('Item added successfully');
            }
            setForm({ name: '', rate: '' });
            setShowForm(false);
            setEditItem(null);
            fetchMenu();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed');
        }
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setForm({ name: item.Name, rate: item.Rate });
        setShowForm(true);
    };

    const handleToggleStatus = async (item) => {
        const newStatus = item.Status === 'Active' ? 'Inactive' : 'Active';
        try {
            await updateMenuStatus(item.ItemID, newStatus);
            fetchMenu();
        } catch (err) {
            console.error(err);
        }
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
                    <div className="admin-nav-item" onClick={() => navigate('/admin/deposits')}>Deposits</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/sales')}>Sales Report</div>
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/menu')}>Menu Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/users')}>User Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/import')}>Data Import</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/barcodes')}>Barcode Generator</div>
                <div className="admin-nav-item" onClick={() => navigate('/admin/add-parent')}>Add Parent</div>
                </nav>
            </div>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Menu Management</h1>
                        <p>Add, edit and manage canteen menu items</p>
                    </div>
                    <button className="admin-add-btn" onClick={() => { setShowForm(true); setEditItem(null); setForm({ name: '', rate: '' }); }}>
                        + Add Item
                    </button>
                </div>

                {showForm && (
                    <div className="admin-card" style={{ marginBottom: '24px' }}>
                        <h3>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-row">
                                <div className="admin-input-group">
                                    <label>Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rice Plate"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Price (&#8377;)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 60"
                                        value={form.rate}
                                        onChange={(e) => setForm({ ...form, rate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            {error && <p className="admin-error">{error}</p>}
                            {success && <p className="admin-success">{success}</p>}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit">{editItem ? 'Update Item' : 'Add Item'}</button>
                                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="admin-table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item Name</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menu.map((item, idx) => (
                                <tr key={item.ItemID}>
                                    <td>{idx + 1}</td>
                                    <td>{item.Name}</td>
                                    <td>&#8377;{parseFloat(item.Rate).toFixed(2)}</td>
                                    <td>
                                        <span className={item.Status === 'Active' ? 'badge-green' : 'badge-red'}>
                                            {item.Status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="admin-action-btn" onClick={() => handleEdit(item)}>Edit</button>
                                        <button
                                            className={`admin-action-btn ${item.Status === 'Active' ? 'danger' : 'success'}`}
                                            onClick={() => handleToggleStatus(item)}
                                        >
                                            {item.Status === 'Active' ? 'Disable' : 'Enable'}
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

export default MenuManagement;