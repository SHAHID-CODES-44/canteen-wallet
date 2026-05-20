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
        const m = localStorage.getItem('paymentMode');
        if (!s || !c) { navigate('/cashier/search'); return; }
        setStudent(JSON.parse(s));
        setCart(JSON.parse(c));
        setPaymentMode(m || 'Wallet');
    }, []);

    const getTotal = () => cart.reduce((sum, item) =>
        sum + (parseFloat(item.Rate) * item.qty), 0
    );

    const handleConfirm = async () => {
        setError('');
        setLoading(true);
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
                cartItems: cart
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
    const balance = parseFloat(student.Balance);

    return (
        <div className="checkout-page">
            <div className="checkout-topbar">
                <button className="checkout-back" onClick={() => navigate('/cashier/cart')}>
                    &#8592; Back to Cart
                </button>
                <h2>Checkout</h2>
                <div></div>
            </div>

            <div className="checkout-content">
                {/* STUDENT INFO */}
                <div className="checkout-student">
                    <div className="checkout-avatar">{student.Name.charAt(0)}</div>
                    <div>
                        <h3>{student.Name}</h3>
                        <p>{student.ClassName} — Division {student.DivName}</p>
                    </div>
                    <div className="checkout-mode-badge">{paymentMode}</div>
                </div>

                {/* ORDER ITEMS */}
                <div className="checkout-card">
                    <h3 className="checkout-card-title">Order Items</h3>
                    {cart.map((item) => (
                        <div key={item.ItemID} className="checkout-item-row">
                            <span>{item.Name} x{item.qty}</span>
                            <span>&#8377;{(parseFloat(item.Rate) * item.qty).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="checkout-total-row">
                        <span>Total Amount</span>
                        <span>&#8377;{total.toFixed(2)}</span>
                    </div>
                </div>

                {/* PAYMENT INFO */}
                {paymentMode === 'Wallet' && (
                    <div className="checkout-card">
                        <h3 className="checkout-card-title">Wallet Payment</h3>
                        <div className="checkout-item-row">
                            <span>Current Balance</span>
                            <span>&#8377;{balance.toFixed(2)}</span>
                        </div>
                        <div className="checkout-item-row">
                            <span>Amount to Deduct</span>
                            <span className="red">-&#8377;{total.toFixed(2)}</span>
                        </div>
                        <div className="checkout-total-row">
                            <span>Balance After</span>
                            <span className="green">&#8377;{(balance - total).toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {paymentMode === 'Cash' && (
                    <div className="checkout-card">
                        <h3 className="checkout-card-title">Cash Payment</h3>
                        <p className="checkout-cash-note">
                            Collect &#8377;{total.toFixed(2)} cash from student. No wallet deduction.
                        </p>
                    </div>
                )}

                {error && <p className="checkout-error">{error}</p>}

                <button
                    className="checkout-confirm-btn"
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : `Confirm & Generate Coupon`}
                </button>
            </div>
        </div>
    );
};

export default Checkout;