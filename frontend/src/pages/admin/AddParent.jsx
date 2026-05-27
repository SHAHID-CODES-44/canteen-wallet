import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addParent, addStudent, getClasses, getDivisions, getDeposits } from '../../services/admin';
import AdminSidebar from '../../components/AdminSidebar';

const AddParent = () => {
    const [step, setStep] = useState(1);
    const [classes, setClasses] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newParentID, setNewParentID] = useState(null);

    const [parentForm, setParentForm] = useState({
        name: '',
        mobileNum: '',
        emailID: ''
    });

    const [studentForm, setStudentForm] = useState({
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
            const [classRes, divRes, parentRes] = await Promise.all([
                getClasses(),
                getDivisions(),
                getDeposits()
            ]);
            setClasses(classRes.data);
            setDivisions(divRes.data);
            setParents(parentRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddParent = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await addParent(parentForm);
            // Refresh parents list to get new parent ID
            const res = await getDeposits();
            setParents(res.data);
            const newParent = res.data.find(p => p.MobileNum === parentForm.mobileNum);
            if (newParent) {
                setNewParentID(newParent.PID);
                setStudentForm({ ...studentForm, parentID: newParent.PID });
            }
            setSuccess('Parent added successfully! Now add a student for this parent.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add parent');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await addStudent(studentForm);
            setSuccess('Student added successfully!');
            setTimeout(() => navigate('/admin/deposits'), 1500);
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
                        <h1>Add Parent & Student</h1>
                        <p>Register a new parent and link their child</p>
                    </div>
                </div>

                {/* STEPS */}
                {/* STEPS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 1 ? '#4A90D9' : '#EDF2F7', color: step >= 1 ? 'white' : '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>1</div>
                        <p style={{ fontWeight: '600', color: step >= 1 ? '#4A90D9' : '#718096', fontSize: '14px' }}>Add Parent</p>
                    </div>
                    <div style={{ flex: 1, height: '2px', background: step >= 2 ? '#4A90D9' : '#EDF2F7', maxWidth: '80px' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: step >= 2 ? '#4A90D9' : '#EDF2F7', color: step >= 2 ? 'white' : '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>2</div>
                        <p style={{ fontWeight: '600', color: step >= 2 ? '#4A90D9' : '#718096', fontSize: '14px' }}>Add Student</p>
                    </div>
                </div>

                {/* STEP 1 - ADD PARENT */}
                {step === 1 && (
                    <div className="admin-card">
                        <h3>Parent Information</h3>
                        <form onSubmit={handleAddParent}>
                            <div className="admin-form-row">
                                <div className="admin-input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul Sharma"
                                        value={parentForm.name}
                                        onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Mobile Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9876543210"
                                        value={parentForm.mobileNum}
                                        onChange={(e) => setParentForm({ ...parentForm, mobileNum: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. rahul@gmail.com"
                                        value={parentForm.emailID}
                                        onChange={(e) => setParentForm({ ...parentForm, emailID: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            {error && <p className="admin-error">{error}</p>}
                            {success && <p className="admin-success">{success}</p>}
                            <button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Parent & Continue'}
                            </button>
                        </form>
                    </div>
                )}

                {/* STEP 2 - ADD STUDENT */}
                {step === 2 && (
                    <div className="admin-card">
                        <h3>Student Information</h3>
                        {success && <p className="admin-success">{success}</p>}
                        <form onSubmit={handleAddStudent}>
                            <div className="admin-form-row">
                                <div className="admin-input-group">
                                    <label>Student Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Aditya Sharma"
                                        value={studentForm.name}
                                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Student ID / Perm Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. STU006"
                                        value={studentForm.permNum}
                                        onChange={(e) => setStudentForm({ ...studentForm, permNum: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="admin-input-group">
                                    <label>Class</label>
                                    <select
                                        value={studentForm.classID}
                                        onChange={(e) => setStudentForm({ ...studentForm, classID: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((c) => (
                                            <option key={c.ClassID} value={c.ClassID}>{c.ClassName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-input-group">
                                    <label>Division</label>
                                    <select
                                        value={studentForm.divID}
                                        onChange={(e) => setStudentForm({ ...studentForm, divID: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Division</option>
                                        {divisions.map((d) => (
                                            <option key={d.DivID} value={d.DivID}>{d.DivName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="admin-input-group">
                                    <label>Link to Parent</label>
                                    <select
                                        value={studentForm.parentID}
                                        onChange={(e) => setStudentForm({ ...studentForm, parentID: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Parent</option>
                                        {parents.map((p) => (
                                            <option key={p.PID} value={p.PID}>{p.Name} — {p.MobileNum}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {error && <p className="admin-error">{error}</p>}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" disabled={loading}>
                                    {loading ? 'Adding...' : 'Add Student'}
                                </button>
                                <button type="button" onClick={() => navigate('/admin/deposits')}>
                                    Skip for now
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddParent;