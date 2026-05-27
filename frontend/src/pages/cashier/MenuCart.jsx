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
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const s = localStorage.getItem('selectedStudent');
        const mode = localStorage.getItem('paymentMode');
        if (!s) {
            navigate('/cashier/search');
            return;
        }
        setStudent(JSON.parse(s));
        if (mode) setPaymentMode(mode);
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
                return prev.map(c => 
                    c.ItemID === item.ItemID 
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
            return prev.map(c => 
                c.ItemID === itemID 
                    ? { ...c, qty: c.qty - 1 }
                    : c
            );
        });
    };

    const updateQuantity = (itemID, newQty) => {
        if (newQty <= 0) {
            setCart(prev => prev.filter(c => c.ItemID !== itemID));
        } else {
            setCart(prev => 
                prev.map(c => 
                    c.ItemID === itemID 
                        ? { ...c, qty: newQty }
                        : c
                )
            );
        }
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + (parseFloat(item.Rate) * item.qty), 0);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('paymentMode', paymentMode);
        navigate('/cashier/checkout');
    };

    const clearCart = () => {
        setCart([]);
    };

    // Get unique categories
    const categories = ['all', ...new Set(menu.map(item => item.Category || 'Other'))];
    
    const filteredMenu = menu.filter(item => {
        const matchesCategory = activeCategory === 'all' || (item.Category || 'Other') === activeCategory;
        const matchesSearch = item.Name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const balance = student ? parseFloat(student.Balance) : 0;
    const total = getTotal();
    const insufficientBalance = paymentMode === 'Wallet' && total > balance;

    if (loading) {
        return <div className="cashier-loading">Loading menu...</div>;
    }

    return (
        <div className="cashier-app">
            {/* Header */}
            <div className="cashier-header">
                <button className="cashier-back-btn" onClick={() => navigate('/cashier/student')}>
                    ← Back
                </button>
                <div className="cashier-station">
                    Station: {localStorage.getItem('stationName') || 'Counter 1'}
                </div>
                <button className="cashier-logout-btn" onClick={() => navigate('/')}>
                    Logout
                </button>
            </div>

            {/* Student Info Bar */}
            <div className="cashier-student-bar">
                <div className="student-info">
                    <div className="student-avatar">
                        {student?.Name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <h3>{student?.Name}</h3>
                        <p>{student?.ClassName} - {student?.DivName}</p>
                    </div>
                </div>
                <div className="student-balance">
                    <span>Balance</span>
                    <strong>₹{balance.toFixed(2)}</strong>
                </div>
                <div className="payment-mode-selector">
                    <button 
                        className={`mode-btn ${paymentMode === 'Wallet' ? 'active' : ''}`}
                        onClick={() => setPaymentMode('Wallet')}
                    >
                        Wallet
                    </button>
                    <button 
                        className={`mode-btn ${paymentMode === 'Cash' ? 'active' : ''}`}
                        onClick={() => setPaymentMode('Cash')}
                    >
                        Cash
                    </button>
                </div>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="cashier-main">
                {/* Left Column - Menu */}
                <div className="cashier-menu-section">
                    {/* Search & Categories */}
                    <div className="menu-search">
                        <input
                            type="text"
                            placeholder="🔍 Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="menu-categories">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === 'all' ? 'All Items' : cat}
                            </button>
                        ))}
                    </div>
                    <div className="menu-items">
                        {filteredMenu.map(item => {
                            const cartItem = cart.find(c => c.ItemID === item.ItemID);
                            const qty = cartItem?.qty || 0;
                            return (
                                <div key={item.ItemID} className="menu-item">
                                    <div className="menu-item-info">
                                        <span className="menu-item-name">{item.Name}</span>
                                        <span className="menu-item-price">₹{parseFloat(item.Rate).toFixed(2)}</span>
                                    </div>
                                    <div className="menu-item-actions">
                                        {qty > 0 ? (
                                            <div className="qty-controls">
                                                <button onClick={() => updateQuantity(item.ItemID, qty - 1)}>-</button>
                                                <span>{qty}</span>
                                                <button onClick={() => updateQuantity(item.ItemID, qty + 1)}>+</button>
                                            </div>
                                        ) : (
                                            <button className="add-btn" onClick={() => addToCart(item)}>+ Add</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column - Cart */}
                <div className="cashier-cart-section">
                    <div className="cart-header">
                        <h3>🛒 Current Order</h3>
                        {cart.length > 0 && (
                            <button className="clear-cart-btn" onClick={clearCart}>
                                Clear All
                            </button>
                        )}
                    </div>
                    
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <span>🛒</span>
                            <p>No items added</p>
                            <small>Tap items from the menu</small>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item.ItemID} className="cart-item">
                                        <div className="cart-item-info">
                                            <span className="cart-item-name">{item.Name}</span>
                                            <span className="cart-item-price">₹{parseFloat(item.Rate).toFixed(2)}</span>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button onClick={() => updateQuantity(item.ItemID, item.qty - 1)}>-</button>
                                            <span>{item.qty}</span>
                                            <button onClick={() => updateQuantity(item.ItemID, item.qty + 1)}>+</button>
                                        </div>
                                        <div className="cart-item-total">
                                            ₹{(parseFloat(item.Rate) * item.qty).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-total">
                                <span>Total</span>
                                <strong>₹{total.toFixed(2)}</strong>
                            </div>
                            {paymentMode === 'Wallet' && insufficientBalance && (
                                <div className="balance-warning">
                                    ⚠️ Insufficient balance. Switch to Cash or ask parent to top up.
                                </div>
                            )}
                            <button 
                                className={`checkout-btn ${insufficientBalance ? 'disabled' : ''}`}
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || insufficientBalance}
                            >
                                ✓ Checkout & Print Coupon
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenuCart;