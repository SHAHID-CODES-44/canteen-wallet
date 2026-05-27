import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CouponPrint.css';

const CouponPrint = () => {
    const [coupon, setCoupon] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const lastCoupon = localStorage.getItem('lastCoupon');
        if (!lastCoupon) {
            navigate('/cashier/search');
            return;
        }
        setCoupon(JSON.parse(lastCoupon));
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleNext = () => {
        localStorage.removeItem('selectedStudent');
        localStorage.removeItem('cart');
        localStorage.removeItem('paymentMode');
        localStorage.removeItem('lastCoupon');
        navigate('/cashier/search');
    };

    if (!coupon) return null;

    return (
        <div className="coupon-print-page">
            <div className="coupon-print-actions no-print">
                <button className="print-btn" onClick={handlePrint}>
                    🖨️ Print Coupon
                </button>
                <button className="next-btn" onClick={handleNext}>
                    ➡️ Next Student
                </button>
            </div>

            <div className="coupon-receipt" id="coupon-receipt">
                {/* Header */}
                <div className="coupon-header">
                    <div className="coupon-logo">CW</div>
                    <h2>CanteenWallet</h2>
                    <p>Cashless Canteen System</p>
                </div>

                {/* Coupon Details */}
                <div className="coupon-details">
                    <div className="coupon-row">
                        <span>Coupon #</span>
                        <strong>{coupon.couponID}</strong>
                    </div>
                    <div className="coupon-row">
                        <span>Date & Time</span>
                        <strong>{new Date().toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="coupon-row">
                        <span>Counter</span>
                        <strong>{localStorage.getItem('stationName') || 'Counter 1'}</strong>
                    </div>
                    <div className="coupon-row">
                        <span>Cashier</span>
                        <strong>{localStorage.getItem('cashierName') || 'Cashier'}</strong>
                    </div>
                </div>

                {/* Divider */}
                <div className="coupon-divider"></div>

                {/* Student Info */}
                <div className="coupon-student">
                    <h3>Student Details</h3>
                    <div className="coupon-row">
                        <span>Name</span>
                        <strong>{coupon.studentName}</strong>
                    </div>
                    <div className="coupon-row">
                        <span>Class</span>
                        <strong>{coupon.studentClass} - {coupon.studentDiv}</strong>
                    </div>
                </div>

                {/* Divider */}
                <div className="coupon-divider"></div>

                {/* Items - SPLIT PER ITEM */}
                <div className="coupon-items">
                    <h3>Order Items</h3>
                    <div className="coupon-items-header">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Price</span>
                        <span>Total</span>
                    </div>
                    {coupon.cartItems?.map((item, idx) => (
                        <div key={idx} className="coupon-item-row">
                            <span className="item-name">{item.Name}</span>
                            <span className="item-qty">x{item.qty}</span>
                            <span className="item-price">₹{parseFloat(item.Rate).toFixed(2)}</span>
                            <span className="item-total">₹{(parseFloat(item.Rate) * item.qty).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="coupon-divider"></div>

                {/* Total & Payment */}
                <div className="coupon-total">
                    <div className="coupon-row total">
                        <span>TOTAL</span>
                        <strong>₹{coupon.cartItems?.reduce((sum, item) => sum + (parseFloat(item.Rate) * item.qty), 0).toFixed(2)}</strong>
                    </div>
                    <div className="coupon-row">
                        <span>Payment Mode</span>
                        <strong className={coupon.paymentMode === 'Cash' ? 'cash-mode' : 'wallet-mode'}>
                            {coupon.paymentMode === 'Cash' ? '💵 CASH' : '💳 WALLET'}
                        </strong>
                    </div>
                </div>

                {/* Footer */}
                <div className="coupon-footer">
                    <p>Thank you for using CanteenWallet!</p>
                    <p className="small">This coupon is valid for this transaction only.</p>
                </div>
            </div>
        </div>
    );
};

export default CouponPrint;