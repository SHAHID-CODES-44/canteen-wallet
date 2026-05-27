import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeposits, getStudents } from '../../services/admin';
import AdminSidebar from '../../components/AdminSidebar';

const ParentsList = () => {
    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [parentsRes, studentsRes] = await Promise.all([
                getDeposits(),
                getStudents()
            ]);

            // Group students by ParentID
            const studentsByParent = {};
            studentsRes.data.forEach(student => {
                const parentId = student.ParentID;
                if (!studentsByParent[parentId]) {
                    studentsByParent[parentId] = [];
                }
                studentsByParent[parentId].push(student);
            });

            // Attach students to each parent
            const parentsWithChildren = parentsRes.data.map(parent => ({
                ...parent,
                children: studentsByParent[parent.PID] || []
            }));

            setParents(parentsWithChildren);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredParents = parents.filter(parent =>
        parent.Name.toLowerCase().includes(search.toLowerCase()) ||
        parent.MobileNum.includes(search)
    );

    if (loading) return <div className="admin-loading">Loading...</div>;

    return (
        <div className="admin-layout">
            <AdminSidebar/>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Parents & Their Wards</h1>
                        <p>View all parents and their linked children</p>
                    </div>
                </div>

                <div className="admin-filters">
                    <input
                        type="text"
                        placeholder="Search by parent name or mobile..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="admin-search-input"
                    />
                </div>

                <div className="admin-table-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Parent Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Children (Wards)</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredParents.map((parent) => (
                                <tr key={parent.PID}>
                                    <td>{parent.Name}</td>
                                    <td>{parent.MobileNum}</td>
                                    <td>{parent.EMailID}</td>
                                    <td>
                                        {parent.children.length === 0 ? (
                                            <span style={{ color: '#718096' }}>No children linked</span>
                                        ) : (
                                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                                {parent.children.map(child => (
                                                    <li key={child.SID}>
                                                        {child.Name} - {child.ClassName || 'Class'} {child.DivName ? `(${child.DivName})` : ''}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                    <td className={parseFloat(parent.Balance) < 100 ? 'red-text' : 'green-text'}>
                                        ₹{parseFloat(parent.Balance).toFixed(2)}
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

export default ParentsList;