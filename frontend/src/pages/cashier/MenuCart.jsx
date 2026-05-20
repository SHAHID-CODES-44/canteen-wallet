import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu } from '../../services/cashier';
import './MenuCart.css';

const MenuCart = () => {
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState(null);
    const [paymentMode, setPaymentMode] = useState('Wallet');
    const navigate = useNavigate();

    useEffect(() => {
        const s = localStorage.getItem('selectedStudent');
        const m = localStorage.getItem('paymentMode');
        if (!s) { navigate('/cashier/search'); return; }
        setStudent(JSON.parse(s));
        setPaymentMode(m || 'Wallet');
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const res = await getMenu();
            setMenu(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.ItemID === item.ItemID);
            if (existing) {
                return prev.map(c => c.ItemID === item.ItemID
                    ? { ...c, qty: c.qty + 1 }
                    : c
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemID) => {
        setCart(prev => {
            const existing = prev.find(c => c.ItemID === itemID);
            if (existing?.qty === 1) {
                return prev.filter(c => c.ItemID !== itemID);
            }
            return prev.map(c => c.ItemID === itemID
                ? { ...c, qty: c.qty - 1 }
                : c
            );
        });
    };

    const getTotal = () => cart.reduce((sum, item) => sum + (parseFloat(item.Rate) * item.qty), 0);

    const getCartQty = (itemID) => {
        const item = cart.find(c => c.ItemID === itemID);
        return item ? item.qty : 0;
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        localStorage.setItem('cart', JSON.stringify(cart));
        navigate('/cashier/checkout');
    };

    const balance = student ? parseFloat(student.Balance) : 0;
    const total = getTotal();
    const insufficientBalance = paymentMode === 'Wallet' && total > balance;

    if (loading) return <div className="cart-loading">Loading menu...</div>;

    return (
        <div className="cart-page">
            {/* TOP BAR */}
            <div className="cart-topbar">
                <button className="cart-back" onClick={() => navigate('/cashier/student')}>
                    &#8592; Back
                </button>
                <div className="cart-student-info">
                    <h3>{student?.Name}</h3>
                    <p>Balance: &#8377;{balance.toFixed(2)} | Mode: {paymentMode}</p>
                </div>
                <div className="cart-total-badge">
                    &#8377;{total.toFixed(2)}
                </div>
            </div>

            <div className="cart-layout">
                {/* MENU GRID */}
                <div className="cart-menu">
                    <h2 className="cart-menu-title">Menu Items</h2>
                    <div className="cart-menu-grid">
                        {menu.map((item) => {
                            const qty = getCartQty(item.ItemID);
                            return (
                                <div key={item.ItemID} className={`cart-item-tile ${qty > 0 ? 'in-cart' : ''}`}>
                                    <div className="cart-item-name">{item.Name}</div>
                                    <div className="cart-item-price">&#8377;{parseFloat(item.Rate).toFixed(2)}</div>
                                    <div className="cart-item-controls">
                                        {qty > 0 ? (
                                            <>
                                                <button className="cart-minus" onClick={() => removeFromCart(item.ItemID)}>-</button>
                                                <span className="cart-qty">{qty}</span>
                                                <button className="cart-plus" onClick={() => addToCart(item)}>+</button>
                                            </>
                                        ) : (
                                            <button className="cart-add-btn" onClick={() => addToCart(item)}>Add</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CART PANEL */}
                <div className="cart-panel">
                    <h2 className="cart-panel-title">Order Summary</h2>
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <p>No items added yet</p>
                            <small>Tap items from menu to add</small>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items-list">
                                {cart.map((item) => (
                                    <div key={item.ItemID} className="cart-panel-row">
                                        <div>
                                            <p className="cart-panel-name">{item.Name}</p>
                                            <small>&#8377;{parseFloat(item.Rate).toFixed(2)} x {item.qty}</small>
                                        </div>
                                        <p className="cart-panel-amount">
                                            &#8377;{(parseFloat(item.Rate) * item.qty).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-panel-total">
                                <span>Total</span>
                                <span>&#8377;{total.toFixed(2)}</span>
                            </div>
                            {paymentMode === 'Wallet' && (
                                <div className="cart-balance-check">
                                    <span>Wallet Balance</span>
                                    <span className={insufficientBalance ? 'red' : 'green'}>
                                        &#8377;{balance.toFixed(2)}
                                    </span>
                                </div>
                            )}
                            {insufficientBalance && (
                                <p className="cart-insufficient">Insufficient wallet balance!</p>
                            )}
                            <button
                                className="cart-checkout-btn"
                                onClick={handleCheckout}
                                disabled={insufficientBalance || cart.length === 0}
                            >
                                Proceed to Checkout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuCart;