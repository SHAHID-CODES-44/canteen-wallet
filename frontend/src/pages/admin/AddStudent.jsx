import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParents, getClasses, getDivisions, addStudent } from '../../services/admin';
import AdminSidebar from '../../components/AdminSidebar';
import "./Admin.css";

const AddStudent = () => {
    const [parents, setParents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        permNum: '',
        classID: '',
        divID: '',
        parentID: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [parentsRes, classesRes, divisionsRes] = await Promise.all([
                getParents(),
                getClasses(),
                getDivisions()
            ]);
            setParents(parentsRes.data);
            setClasses(classesRes.data);
            setDivisions(divisionsRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load data');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await addStudent(formData);
            setSuccess('Student added successfully!');
            setTimeout(() => navigate('/admin/students'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Add Student</h1>
                        <p>Register a new student and link to existing parent</p>
                    </div>
                </div>

                <div className="admin-card">
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-row">
                            <div className="admin-input-group">
                                <label>Student Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Aditya Sharma"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="admin-input-group">
                                <label>Student ID / Perm Number *</label>
                                <input
                                    type="text"
                                    name="permNum"
                                    placeholder="e.g. STU001"
                                    value={formData.permNum}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-input-group">
                                <label>Class *</label>
                                <select
                                    name="classID"
                                    value={formData.classID}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c) => (
                                        <option key={c.ClassID} value={c.ClassID}>
                                            {c.ClassName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-input-group">
                                <label>Division *</label>
                                <select
                                    name="divID"
                                    value={formData.divID}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Division</option>
                                    {divisions.map((d) => (
                                        <option key={d.DivID} value={d.DivID}>
                                            {d.DivName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="admin-input-group">
                            <label>Link to Parent *</label>
                            <select
                                name="parentID"
                                value={formData.parentID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Parent</option>
                                {parents.map((p) => (
                                    <option key={p.PID} value={p.PID}>
                                        {p.Name} — {p.MobileNum}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && <p className="admin-error">{error}</p>}
                        {success && <p className="admin-success">{success}</p>}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Student'}
                            </button>
                            <button type="button" onClick={() => navigate('/admin/students')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;