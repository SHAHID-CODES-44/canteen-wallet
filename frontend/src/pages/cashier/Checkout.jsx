import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCoupon } from '../../services/cashier';
import './Checkout.css';

const Checkout = () => {
    const [student, setStudent] = useState(null);
    const [cart, setCart] = useState([]);
    const [paymentMode, setPaymentMode] = useState('Wallet');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const s = localStorage.getItem('selectedStudent');
        const c = localStorage.getItem('cart');
        const mode = localStorage.getItem('paymentMode');
        
        if (!s || !c) { 
            navigate('/cashier/search'); 
            return; 
        }
        
        setStudent(JSON.parse(s));
        setCart(JSON.parse(c));
        setPaymentMode(mode || 'Wallet');  // 👈 Fixed: use mode from localStorage
    }, []);

    const getTotal = () => cart.reduce((sum, item) =>
        sum + (parseFloat(item.Rate) * item.qty), 0
    );

    const handleConfirm = async () => {
        setError('');
        setLoading(true);
        
        const total = getTotal();
        const balance = parseFloat(student?.Balance || 0);
        
        // 👈 Check balance only for Wallet mode
        if (paymentMode === 'Wallet' && total > balance) {
            setError('Insufficient wallet balance. Please use Cash mode or ask parent to top up.');
            setLoading(false);
            return;
        }
        
        try {
            const items = cart.flatMap(item =>
                Array(item.qty).fill({ itemID: item.ItemID, rate: parseFloat(item.Rate) })
            );
            const res = await createCoupon({
                studentID: student.SID,
                mode: paymentMode,
                items
            });
            localStorage.setItem('lastCoupon', JSON.stringify({
                ...res.data,
                studentName: student.Name,
                studentClass: student.ClassName,
                studentDiv: student.DivName,
                cartItems: cart,
                paymentMode: paymentMode
            }));
            navigate('/cashier/coupon');
        } catch (err) {
            setError(err.response?.data?.message || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (!student) return null;

    const total = getTotal();
    const balance = parseFloat(student.Balance || 0);
    const insufficientBalance = paymentMode === 'Wallet' && total > balance;

    return (
        <div className="checkout-page">
            <div className="checkout-topbar">
                <button className="checkout-back" onClick={() => navigate('/cashier/cart')}>
                    ← Back to Cart
                </button>
                <h2>Checkout</h2>
                <div></div>
            </div>

            <div className="checkout-content">
                {/* STUDENT INFO */}
                <div className="checkout-student">
                    <div className="checkout-avatar">{student.Name?.charAt(0) || 'S'}</div>
                    <div>
                        <h3>{student.Name}</h3>
                        <p>{student.ClassName} — Division {student.DivName}</p>
                    </div>
                    <div className={`checkout-mode-badge ${paymentMode === 'Cash' ? 'cash' : 'wallet'}`}>
                        {paymentMode === 'Cash' ? '💵 Cash Payment' : '💳 Wallet Payment'}
                    </div>
                </div>

                {/* ORDER ITEMS */}
                <div className="checkout-card">
                    <h3 className="checkout-card-title">Order Items</h3>
                    {cart.map((item) => (
                        <div key={item.ItemID} className="checkout-item-row">
                            <span>{item.Name} x{item.qty}</span>
                            <span>₹{(parseFloat(item.Rate) * item.qty).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="checkout-total-row">
                        <span>Total Amount</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>

                {/* WALLET PAYMENT INFO */}
                {paymentMode === 'Wallet' && (
                    <div className="checkout-card">
                        <h3 className="checkout-card-title">💳 Wallet Payment</h3>
                        <div className="checkout-item-row">
                            <span>Current Balance</span>
                            <span>₹{balance.toFixed(2)}</span>
                        </div>
                        <div className="checkout-item-row">
                            <span>Amount to Deduct</span>
                            <span className={insufficientBalance ? 'red' : ''}>-₹{total.toFixed(2)}</span>
                        </div>
                        <div className="checkout-total-row">
                            <span>Balance After</span>
                            <span className={insufficientBalance ? 'red' : 'green'}>
                                ₹{(balance - total).toFixed(2)}
                            </span>
                        </div>
                        {insufficientBalance && (
                            <div className="checkout-warning">
                                ⚠️ Insufficient balance! Please switch to Cash mode.
                            </div>
                        )}
                    </div>
                )}

                {/* CASH PAYMENT INFO */}
                {paymentMode === 'Cash' && (
                    <div className="checkout-card cash-card">
                        <h3 className="checkout-card-title">💵 Cash Payment</h3>
                        <p className="checkout-cash-note">
                            Collect <strong>₹{total.toFixed(2)}</strong> cash from student.
                            No wallet deduction will be made.
                        </p>
                    </div>
                )}

                {error && <p className="checkout-error">{error}</p>}

                <button
                    className={`checkout-confirm-btn ${insufficientBalance ? 'disabled' : ''}`}
                    onClick={handleConfirm}
                    disabled={loading || insufficientBalance}
                >
                    {loading ? 'Processing...' : `✓ Confirm & Generate Coupon`}
                </button>
            </div>
        </div>
    );
};

export default Checkout;