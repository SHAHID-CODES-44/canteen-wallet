import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DataImport = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);

        // Preview CSV
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n').filter(line => line.trim());
            const rows = lines.map(line => line.split(','));
            setPreview(rows.slice(0, 6));
        };
        reader.readAsText(selectedFile);
    };

    const downloadTemplate = () => {
        const template = 'StudentName,PermNum,Class,Division,ParentName,ParentMobile,ParentEmail\nAditya Sharma,STU001,8,A,Rahul Sharma,9876543210,rahul@gmail.com';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        a.click();
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
                    <div className="admin-nav-item" onClick={() => navigate('/admin/topup')}>Manual Top Up</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/sales')}>Sales Report</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/menu')}>Menu Management</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/users')}>User Management</div>
                    <div className="admin-nav-item active" onClick={() => navigate('/admin/import')}>Data Import</div>
                    <div className="admin-nav-item" onClick={() => navigate('/admin/barcodes')}>Barcode Generator</div>
                </nav>
            </div>

            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>Data Import</h1>
                        <p>Import student and parent data via CSV</p>
                    </div>
                    <button className="admin-export-btn" onClick={downloadTemplate}>
                        Download Template
                    </button>
                </div>

                <div className="admin-card">
                    <h3>Upload CSV File</h3>
                    <p style={{ color: '#718096', fontSize: '13px', marginBottom: '16px' }}>
                        Upload a CSV file with student and parent information. Download the template above for the correct format.
                    </p>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="admin-file-input"
                    />

                    {preview.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ marginBottom: '12px' }}>Preview (first 5 rows)</h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            {preview[0]?.map((header, idx) => (
                                                <th key={idx}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(1).map((row, idx) => (
                                            <tr key={idx}>
                                                {row.map((cell, cellIdx) => (
                                                    <td key={cellIdx}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p style={{ color: '#718096', fontSize: '12px', marginTop: '8px' }}>
                                Note: Full CSV import functionality will be connected in the next phase.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataImport;