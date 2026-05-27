import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, createUser } from '../../services/admin';
import AdminSidebar from '../../components/AdminSidebar';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', level: 'Cashier' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await getUsers();
            setUsers(res.data);
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
            await createUser(form);
            setSuccess('User created successfully');
            setForm({ username: '', password: '', level: 'Cashier' });
            setShowForm(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-layout">
           <AdminSidebar/>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Manage cashier and admin accounts</p>
                    </div>
                    <button className="admin-add-btn" onClick={() => setShowForm(true)}>
                        + Add User
                    </button>
                </div>

                {showForm && (
                    <div className="admin-card" style={{ marginBottom: '24px' }}>
                        <h3>Create New User</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="admin-form-row">
                                <div className="admin-input-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        value={form.username}
                                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Role</label>
                                    <select
                                        value={form.level}
                                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                                    >
                                        <option value="Cashier">Cashier</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            {error && <p className="admin-error">{error}</p>}
                            {success && <p className="admin-success">{success}</p>}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit">Create User</button>
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
                                <th>Username</th>
                                <th>Role</th>
                                <th>Last Login</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, idx) => (
                                <tr key={user.UserID}>
                                    <td>{idx + 1}</td>
                                    <td>{user.Username}</td>
                                    <td>
                                        <span className={user.Level === 'Admin' ? 'badge-blue' : 'badge-green'}>
                                            {user.Level}
                                        </span>
                                    </td>
                                    <td>{user.LastLogin
                                        ? new Date(user.LastLogin).toLocaleDateString('en-IN')
                                        : 'Never'}
                                    </td>
                                    <td>
                                        <span className={user.Status === 'Active' ? 'badge-green' : 'badge-red'}>
                                            {user.Status}
                                        </span>
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

export default UserManagement;