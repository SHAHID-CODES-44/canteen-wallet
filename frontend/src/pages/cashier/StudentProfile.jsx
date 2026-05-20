import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentProfile.css';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Wallet');
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('selectedStudent');
        if (!data) { navigate('/cashier/search'); return; }
        setStudent(JSON.parse(data));
    }, []);

    const handleProceed = () => {
        localStorage.setItem('paymentMode', paymentMode);
        navigate('/cashier/cart');
    };

    const isLowBalance = student && parseFloat(student.Balance) < 50;

    if (!student) return null;

    return (
        <div className="profile-page">
            <div className="profile-topbar">
                <button className="profile-back" onClick={() => navigate('/cashier/search')}>
                    &#8592; Back to Search
                </button>
                <h2>Student Profile</h2>
                <div></div>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {student.Name.charAt(0)}
                    </div>
                    <h1>{student.Name}</h1>
                    <p>{student.ClassName} — Division {student.DivName}</p>
                    <p className="profile-id">ID: {student.PermNum}</p>
                </div>

                <div className="profile-balance-card">
                    <p className="balance-label">Parent Wallet Balance</p>
                    <h2 className={isLowBalance ? 'low' : ''}>
                        &#8377;{parseFloat(student.Balance).toFixed(2)}
                    </h2>
                    {isLowBalance && (
                        <p className="low-warning">Low balance — consider cash payment</p>
                    )}
                </div>

                <div className="profile-payment-mode">
                    <p className="mode-label">Select Payment Mode</p>
                    <div className="mode-options">
                        <div
                            className={`mode-card ${paymentMode === 'Wallet' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('Wallet')}
                        >
                            <h3>Wallet</h3>
                            <p>Deduct from parent wallet</p>
                        </div>
                        <div
                            className={`mode-card ${paymentMode === 'Cash' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('Cash')}
                        >
                            <h3>Cash</h3>
                            <p>Collect cash from student</p>
                        </div>
                    </div>
                </div>

                <button className="profile-proceed-btn" onClick={handleProceed}>
                    Add Items to Cart &#8594;
                </button>
            </div>
        </div>
    );
};

export default StudentProfile;