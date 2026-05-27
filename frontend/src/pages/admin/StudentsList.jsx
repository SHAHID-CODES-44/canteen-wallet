import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../../services/admin';
import AdminSidebar from '../../components/AdminSidebar';

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await getStudents();
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.Name.toLowerCase().includes(search.toLowerCase()) ||
        student.PermNum.includes(search) ||
        (student.ParentName && student.ParentName.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar/>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Students List</h1>
                        <p>View all students registered in the system</p>
                    </div>
                </div>

                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Search by student name, Perm ID, or parent name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                <div className="admin-table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Perm Number</th>
                                <th>Class</th>
                                <th>Division</th>
                                <th>Parent Name</th>
                                <th>Status</th>
                                <th>Barcode</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student.SID}>
                                    <td>{student.Name}</td>
                                    <td>{student.PermNum}</td>
                                    <td>{student.ClassName || '-'}</td>
                                    <td>{student.DivName || '-'}</td>
                                    <td>{student.ParentName || 'Not linked'}</td>
                                    <td>
                                        <span className={student.Status === 'Active' ? 'badge-green' : 'badge-red'}>
                                            {student.Status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="admin-action-btn"
                                            onClick={() => navigate('/admin/barcodes', { state: { student } })}
                                        >
                                            Generate Barcode
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

export default StudentsList;