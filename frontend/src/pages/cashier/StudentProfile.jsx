import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentProfile.css';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Wallet');
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('selectedStudent');
        if (!data) { 
            navigate('/cashier/search'); 
            return; 
        }
        setStudent(JSON.parse(data));
    }, []);

    const handleProceed = () => {
        localStorage.setItem('paymentMode', paymentMode);
        navigate('/cashier/cart');
    };

    if (!student) return null;

    const balance = parseFloat(student.Balance || 0);
    const isLowBalance = balance < 50;

    return (
        <div className="student-profile-page">
            <div className="profile-header">
                <button className="back-btn" onClick={() => navigate('/cashier/search')}>
                    ← Back
                </button>
                <div className="header-station">
                    Station: {localStorage.getItem('stationName') || 'Counter 1'}
                </div>
            </div>

            <div className="profile-container">
                {/* Student Card */}
                <div className="student-card-large">
                    <div className="student-avatar-large">
                        {student.Name?.charAt(0) || 'S'}
                    </div>
                    <h2>{student.Name}</h2>
                    <p className="student-class">{student.ClassName} • Division {student.DivName}</p>
                    <p className="student-id">ID: {student.PermNum}</p>
                </div>

                {/* Balance Card */}
                <div className={`balance-card ${isLowBalance ? 'low' : ''}`}>
                    <span className="balance-label">Parent Wallet Balance</span>
                    <div className="balance-amount">₹{balance.toFixed(2)}</div>
                    {isLowBalance && (
                        <div className="balance-warning">
                            Low balance - Consider cash payment
                        </div>
                    )}
                </div>

                {/* Payment Mode Selection */}
                <div className="payment-section">
                    <p className="section-label">Payment Method</p>
                    <div className="payment-options">
                        <div
                            className={`payment-option ${paymentMode === 'Wallet' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('Wallet')}
                        >
                           
                            <div>
                                <h4>Wallet</h4>
                                <p>Deduct from parent wallet</p>
                            </div>
                            {paymentMode === 'Wallet' && <span className="check-mark">✓</span>}
                        </div>
                        <div
                            className={`payment-option ${paymentMode === 'Cash' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('Cash')}
                        >
                        
                            <div>
                                <h4>Cash</h4>
                                <p>Collect cash from student</p>
                            </div>
                            {paymentMode === 'Cash' && <span className="check-mark">✓</span>}
                        </div>
                    </div>
                </div>

                {/* Proceed Button */}
                <button className="proceed-btn" onClick={handleProceed}>
                    Add Items to Cart →
                </button>
            </div>
        </div>
    );
};

export default StudentProfile;