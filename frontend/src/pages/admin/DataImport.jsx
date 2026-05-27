import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { importStudents } from '../../services/admin';
import './DataImport.css';

const DataImport = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [importedData, setImportedData] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResult(null);
        setImportedData(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await importStudents(formData);
            setResult(res.data);
            
            // Parse and store imported data for preview
            if (res.data.importedRows) {
                setImportedData(res.data.importedRows);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = `Student ID,Name,Class,Parent Name,Parent Mobile\nSTU001,Aditya Sharma,5,Rahul Sharma,9876543210\nSTU002,Priya Sharma,3,Rahul Sharma,9876543210\nSTU003,Arjun Desai,7,Meera Desai,9876543211`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

const viewImportedData = () => {
    navigate('/admin/students');
};
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                <div className="admin-page-header">
                    <div>
                        <h1>📥 Import Students</h1>
                        <p>Upload CSV file to bulk import students and auto-create parent accounts</p>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="import-info">
                        <h3>CSV Format Instructions</h3>
                        <ul>
                            <li><strong>Student ID</strong> - Unique identifier (e.g., STU001)</li>
                            <li><strong>Name</strong> - Student's full name</li>
                            <li><strong>Class</strong> - Class name (auto-created if new)</li>
                            <li><strong>Parent Name</strong> - Parent's full name</li>
                            <li><strong>Parent Mobile</strong> - 10-digit mobile number</li>
                        </ul>
                        <button className="download-template-btn" onClick={downloadTemplate}>
                            📥 Download CSV Template
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="import-form">
                        <div className="import-input-group">
                            <label>Select CSV File</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        {error && <p className="import-error">{error}</p>}

                        <button type="submit" disabled={loading} className="import-btn">
                            {loading ? '⏳ Importing...' : '🚀 Upload & Import'}
                        </button>
                    </form>

                    {/* Import Result Section */}
                    {result && (
                        <div className="import-result">
                            <div className="result-header">
                                <h3>📊 Import Summary</h3>
                                {result.successCount > 0 && (
                                    <button className="view-imported-btn" onClick={viewImportedData}>
                                        👁️ View Imported Data
                                    </button>
                                )}
                            </div>
                            
                            <div className="result-stats">
                                <div className="stat-card-success">
                                    <div className="stat-icon">✅</div>
                                    <div>
                                        <span>Successful</span>
                                        <strong>{result.successCount}</strong>
                                        <p>records imported</p>
                                    </div>
                                </div>
                                <div className="stat-card-failed">
                                    <div className="stat-icon">❌</div>
                                    <div>
                                        <span>Failed</span>
                                        <strong>{result.errors?.length || 0}</strong>
                                        <p>records failed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Success Message */}
                            {result.successCount > 0 && (
                                <div className="import-success-message">
                                    <span>🎉 Successfully imported {result.successCount} student{result.successCount !== 1 ? 's' : ''}!</span>
                                    <p>Parent accounts were auto-created for new mobile numbers.</p>
                                </div>
                            )}

                            {/* Errors Section */}
                            {result.errors?.length > 0 && (
                                <div className="import-errors">
                                    <h4>⚠️ Errors Details</h4>
                                    {result.errors.map((err, idx) => (
                                        <div key={idx} className="error-row">
                                            <div className="error-row-header">
                                                <span className="error-badge">Row {idx + 1}</span>
                                            </div>
                                            <div className="error-details">
                                                <p><strong>Error:</strong> {err.error}</p>
                                                <pre>{JSON.stringify(err.row, null, 2)}</pre>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataImport;