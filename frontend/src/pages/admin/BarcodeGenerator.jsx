import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import { getStudents } from '../../services/admin';

const BarcodeGenerator = () => {
    const [students, setStudents] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const barcodeRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => { fetchStudents(); }, []);

    useEffect(() => {
        if (search) {
            setFiltered(students.filter(s =>
                s.Name.toLowerCase().includes(search.toLowerCase()) ||
                s.PermNum.includes(search)
            ));
        } else {
            setFiltered(students);
        }
    }, [search, students]);

    useEffect(() => {
        if (selectedStudent && barcodeRef.current) {
            JsBarcode(barcodeRef.current, selectedStudent.PermNum, {
                format: 'CODE128',
                width: 2,
                height: 80,
                displayValue: true,
                fontSize: 14,
                margin: 10
            });
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await getStudents();
            setStudents(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="admin-layout">
            <div className="admin-sidebar no-print">
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">CW</div>
                    <div><h3>CanteenWallet</h3><p>Admin Panel</p></div>
                </div>
                <nav className="admin-nav">
                    <div className="admin-nav-item" onClick={() => navigate('/admin/dashboard')}>Dashboard</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/deposits')}>Deposits</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/sales')}>Sales Report</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/menu')}>Menu Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/users')}>User Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/import')}>Data Import</div>
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/barcodes')}>Barcode Generator</div>
                <div className="admin-nav-item" onClick={() => navigate('/admin/add-parent')}>Add Parent</div>
                </nav>
            </div>

            <div className="admin-main">
                <div className="admin-page-header no-print">
                    <div>
                        <h1>Barcode Generator</h1>
                        <p>Generate and print student ID barcodes</p>
                    </div>
                </div>

                <div className="admin-barcode-layout">
                    {/* STUDENT LIST */}
                    <div className="admin-card no-print">
                        <h3>Select Student</h3>
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="admin-search-input"
                        />
                        <div className="admin-student-list">
                            {filtered.map((student) => (
                                <div
                                    key={student.SID}
                                    className={`admin-student-item ${selectedStudent?.SID === student.SID ? 'active' : ''}`}
                                    onClick={() => setSelectedStudent(student)}
                                >
                                    <div>
                                        <p>{student.Name}</p>
                                        <small>{student.ClassName} — Div {student.DivName}</small>
                                    </div>
                                    <span>{student.PermNum}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BARCODE DISPLAY */}
                    <div className="admin-card">
                        {selectedStudent ? (
                            <div className="barcode-preview">
                                <div className="barcode-card" id="barcode-print">
                                    <h3>CanteenWallet</h3>
                                    <p className="barcode-student-name">{selectedStudent.Name}</p>
                                    <p className="barcode-class">{selectedStudent.ClassName} — Div {selectedStudent.DivName}</p>
                                    <svg ref={barcodeRef}></svg>
                                    <p className="barcode-id">{selectedStudent.PermNum}</p>
                                    <p className="barcode-parent">Parent: {selectedStudent.ParentName}</p>
                                </div>
                                <button className="admin-print-btn no-print" onClick={handlePrint}>
                                    Print Barcode
                                </button>
                            </div>
                        ) : (
                            <div className="barcode-empty">
                                <p>Select a student to generate barcode</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeGenerator;