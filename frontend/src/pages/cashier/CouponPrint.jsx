import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CouponPrint.css';

const CouponPrint = () => {
    const [coupon, setCoupon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const data = localStorage.getItem('lastCoupon');
        if (!data) { navigate('/cashier/search'); return; }
        setCoupon(JSON.parse(data));
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleNewEntry = () => {
        localStorage.removeItem('selectedStudent');
        localStorage.removeItem('cart');
        localStorage.removeItem('paymentMode');
        localStorage.removeItem('lastCoupon');
        navigate('/cashier/search');
    };

    const formatDateTime = () => {
        return new Date().toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (!coupon) return null;

    return (
        <div className="coupon-page">
            <div className="coupon-topbar no-print">
                <h2>Coupon Generated</h2>
            </div>

            <div className="coupon-content">
                {/* COUPON */}
                <div className="coupon-receipt" id="coupon-print">
                    <div className="coupon-receipt-header">
                        <h2>CanteenWallet</h2>
                        <p>School Canteen Receipt</p>
                        <p>{formatDateTime()}</p>
                    </div>

                    <div className="coupon-divider"></div>

                    <div className="coupon-student-section">
                        <p><strong>Student:</strong> {coupon.studentName}</p>
                        <p><strong>Class:</strong> {coupon.studentClass} — Div {coupon.studentDiv}</p>
                        <p><strong>Coupon ID:</strong> #{coupon.couponID}</p>
                        <p><strong>Payment:</strong> {coupon.mode}</p>
                    </div>

                    <div className="coupon-divider"></div>

                    <div className="coupon-items-section">
                        <p className="coupon-items-title">Items Ordered</p>
                        {coupon.cartItems?.map((item) => (
                            <div key={item.ItemID} className="coupon-item-row">
                                <span>{item.Name} x{item.qty}</span>
                                <span>&#8377;{(parseFloat(item.Rate) * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="coupon-divider"></div>

                    <div className="coupon-total-section">
                        <div className="coupon-total-row">
                            <span>Total Amount</span>
                            <strong>&#8377;{parseFloat(coupon.total).toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="coupon-footer">
                        <p>Thank you!</p>
                        <p>Powered by CanteenWallet</p>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="coupon-actions no-print">
                    <button className="coupon-print-btn" onClick={handlePrint}>
                        Print Coupon
                    </button>
                    <button className="coupon-new-btn" onClick={handleNewEntry}>
                        New Entry &#8594;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponPrint;