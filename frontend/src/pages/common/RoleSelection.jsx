import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './RoleSelection.css';

const roleCards = [
    {
        title: 'Parent',
        description: 'Top up wallet balance, track canteen spending, view transaction history, and manage multiple children from a single account.',
        buttonText: 'Access Parent Portal',
        path: '/parent/login',
        gradient: 'linear-gradient(135deg, #7BB9F2, #4A90D9)',
        stats: '2,450+ active parents',
        color: '#4A90D9',
    },
    {
        title: 'Cashier',
        description: 'Quick student lookup via barcode, build carts, process wallet or cash payments, print coupons, and view day summary.',
        buttonText: 'Access Cashier Portal',
        path: '/cashier/login',
        gradient: 'linear-gradient(135deg, #61C49B, #2F9B69)',  
        stats: '12 active counters',
        color: '#1F7A48',
    },
    {
        title: 'Admin',
        description: 'Monitor deposits and sales, manage menu and users, generate reports, and control all canteen operations.',
        buttonText: 'Access Admin Panel',
        path: '/admin/login',
        gradient: 'linear-gradient(135deg, #F3A952, #D7831C)',
        stats: '6 management modules',
        color: '#B55F0D',
    },
];

const features = [
    { title: 'Real-time Balance Updates', description: 'Wallet reflects top-ups and purchases instantly without delay.' },
    { title: 'Barcode Identification', description: 'Students use existing school ID cards. No additional hardware required.' },
    { title: 'Sales Analytics', description: 'Track popular items, peak hours, and generate daily sales insights.' },
    { title: 'Multi-device Support', description: 'Optimized for parent mobile, cashier tablet, and admin desktop.' },
    { title: 'Offline Cash Mode', description: 'Process payments even when network is unstable.' },
    { title: 'Secure Authentication', description: 'OTP for parents, encrypted passwords for staff accounts.' },
];

const workflow = [
    {
        title: 'Parents add balance',
        text: 'Parents login with OTP, view wallet balance, add mock top-ups, and track every canteen purchase.',
    },
    {
        title: 'Students use ID cards',
        text: 'Students do not need an app. Cashiers identify them using barcode, ID number, or name search.',
    },
    {
        title: 'Cashiers issue coupons',
        text: 'Cashiers add menu items, select wallet or cash mode, checkout, and generate printable coupons.',
    },
    {
        title: 'Admins monitor everything',
        text: 'Admins review deposits, top-ups, sales, item-wise performance, users, and daily operational reports.',
    },
];

const stats = [
    { value: 'Parent', label: 'Wallet top-up and transaction view' },
    { value: 'Cashier', label: 'Barcode lookup and coupon checkout' },
    { value: 'Admin', label: 'Sales, deposits, menu, and users' },
    { value: 'School', label: 'Cashless canteen visibility' },
];

function RoleSelection() {
    const navigate = useNavigate();
    const [aiOpen, setAiOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiMessages, setAiMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi, I can help you understand CanteenWallet, how each role works, security, wallet top-ups, barcode checkout, and reports.'
        }
    ]);

    const resetAiChat = () => {
        setAiMessages([
            {
                role: 'assistant',
                content: 'Chat refreshed. Ask me anything about CanteenWallet.'
            }
        ]);
        setAiInput('');
    };

    const sendAiMessage = async () => {
        const question = aiInput.trim();
        if (!question || aiLoading) return;

        const nextMessages = [
            ...aiMessages,
            { role: 'user', content: question }
        ];

        setAiMessages(nextMessages);
        setAiInput('');
        setAiLoading(true);

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        {
                            role: 'system',
                            content: `You are the CanteenWallet assistant. Answer only questions about this school canteen eWallet app. Keep replies short, clear, friendly, and useful. Explain Parent, Cashier, and Admin roles, wallet top-up, barcode student identification, coupon checkout, reports, and security. Do not make fake claims. If unsure, say it depends on school setup.`
                        },
                        ...nextMessages
                    ],
                    temperature: 0.4,
                    max_tokens: 180
                })
            });

            const data = await response.json();
            const answer = data?.choices?.[0]?.message?.content || 'I could not answer that right now. Please try again.';

            setAiMessages([
                ...nextMessages,
                { role: 'assistant', content: answer }
            ]);
        } catch (err) {
            setAiMessages([
                ...nextMessages,
                { role: 'assistant', content: 'AI assistant is not available right now. Please check the Groq API key and try again.' }
            ]);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAiKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendAiMessage();
        }
    };

    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            },
            { threshold: 0.12 }
        );

        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="role-page">
            <nav className="role-navbar">
                <button className="role-logo" type="button" onClick={() => navigate('/')}>
                    <span className="role-logo-mark">CW</span>
                    <span>CanteenWallet</span>
                </button>
                <div className="role-nav-links">
                    <button type="button" onClick={() => scrollToSection('home')}>Home</button>
                    <button type="button" onClick={() => scrollToSection('about')}>About</button>
                    <button type="button" onClick={() => scrollToSection('roles')}>Login</button>
                    <button type="button" onClick={() => scrollToSection('workflow')}>How it works</button>
                    <button type="button" onClick={() => scrollToSection('features')}>Features</button>
                </div>
            </nav>

            <header className="role-hero" id="home">
                <div className="role-hero-content animate-on-scroll">
                    <span className="role-eyebrow">Cashless school canteen system</span>
                    <h1>Smart Canteen.<br />Cashless Future.</h1>
                    <p>
                        CanteenWallet eliminates cash from school canteens. Parents maintain digital wallet,
                        cashiers serve faster with barcode lookup, and administrators get complete visibility.
                    </p>
                    <div className="role-hero-buttons">
                        <button className="role-hero-btn primary" onClick={() => navigate('/parent/login')}>Parent Portal</button>
                        <button className="role-hero-btn secondary" onClick={() => navigate('/cashier/login')}>Cashier Portal</button>
                    </div>
                </div>

                <div className="role-hero-image animate-on-scroll">
                    <img
                        src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80"
                        alt="Students in a school learning environment"
                    />
                    <div className="role-hero-overlay"></div>
                    <div className="role-hero-card floating-card">
                        <span>Canteen Checkout</span>
                        <strong>Coupon</strong>
                        <p>Wallet or cash mode supported</p>
                    </div>
                    <div className="role-hero-stats">
                        <div className="role-stat-item">
                            <span className="role-stat-number">Wallet</span>
                            <span className="role-stat-label">Parent controlled balance</span>
                        </div>
                        <div className="role-stat-divider"></div>
                        <div className="role-stat-item">
                            <span className="role-stat-number">Barcode</span>
                            <span className="role-stat-label">Student ID lookup</span>
                        </div>
                        <div className="role-stat-divider"></div>
                        <div className="role-stat-item">
                            <span className="role-stat-number">Reports</span>
                            <span className="role-stat-label">Admin visibility</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="role-about" id="about">
                <div className="role-about-image animate-on-scroll">
                    <img
                        src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1200&q=80"
                        alt="Digital payment dashboard"
                    />
                </div>
                <div className="role-about-content animate-on-scroll">
                    <span className="role-section-tag">About</span>
                    <h2>Built to eliminate cash friction in school canteens.</h2>
                    <p>
                        Students lose cash, queues get long, and parents have no visibility.
                        CanteenWallet solves this with a simple digital wallet that works across
                        parents, cashiers, and administrators.
                    </p>
                    <div className="role-about-points">
                        <div><strong>No Student App</strong><p>Students use existing ID cards with barcode. No phone required.</p></div>
                        <div><strong>Mock Top-up</strong><p>Balance management without payment gateway complexity.</p></div>
                        <div><strong>Coupon Printing</strong><p>Bluetooth thermal printer support for instant receipts.</p></div>
                        <div><strong>Data Insights</strong><p>Item-wise sales, popular items, and peak hour analytics.</p></div>
                    </div>
                </div>
            </section>

            {/* AI Chatbot Section - Placed here as requested */}
            <section className="role-ai-section">
                <div className="role-ai-card animate-on-scroll">
                    <div className="role-ai-header">
                        <div>
                            <span className="role-section-tag">AI Help</span>
                            <h2>Ask about CanteenWallet</h2>
                            <p>Need help choosing a role or understanding how the app works?</p>
                        </div>

                        <button
                            type="button"
                            className="role-ai-toggle"
                            onClick={() => setAiOpen(!aiOpen)}
                        >
                            {aiOpen ? 'Close Chat' : 'Talk to Bot'}
                        </button>
                    </div>

                    {aiOpen && (
                        <div className="role-ai-chat">
                            <div className="role-ai-messages">
                                {aiMessages.map((msg, index) => (
                                    <div
                                        key={`${msg.role}-${index}`}
                                        className={`role-ai-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                                {aiLoading && (
                                    <div className="role-ai-message assistant">
                                        Thinking...
                                    </div>
                                )}
                            </div>

                            <div className="role-ai-input-row">
                                <input
                                    type="text"
                                    placeholder="Ask about login, wallet, barcode, reports..."
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={handleAiKeyDown}
                                />
                                <button type="button" onClick={sendAiMessage} disabled={aiLoading}>
                                    Send
                                </button>
                            </div>

                            <button type="button" className="role-ai-refresh" onClick={resetAiChat}>
                                Refresh Chat
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="role-section" id="roles">
                <div className="role-section-heading animate-on-scroll">
                    <span className="role-section-tag">Access Portal</span>
                    <h2>Continue as your role</h2>
                    <p>Select your interface to enter CanteenWallet.</p>
                </div>
                <div className="role-card-grid">
                    {roleCards.map((role, index) => (
                        <div className="role-card animate-on-scroll" key={role.title} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="role-card-icon" style={{ background: `${role.color}10`, color: role.color }}>
                                {role.title.charAt(0)}
                            </div>
                            <h3>{role.title}</h3>
                            <div className="role-card-stats" style={{ background: `${role.color}10`, color: role.color }}>
                                {role.stats}
                            </div>
                            <p>{role.description}</p>
                            <button type="button" onClick={() => navigate(role.path)} style={{ background: role.gradient }}>
                                {role.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="role-workflow" id="workflow">
                <div className="role-section-heading animate-on-scroll">
                    <span className="role-section-tag">How it works</span>
                    <h2>One system, three simple user journeys</h2>
                    <p>Each role gets only the tools they need for clean daily operations.</p>
                </div>
                <div className="role-workflow-grid">
                    {workflow.map((item, index) => (
                        <article className="role-workflow-card animate-on-scroll" key={item.title}>
                            <span>{String(index + 1).padStart(2, '0')}</span>
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="role-features" id="features">
                <div className="role-section-heading animate-on-scroll">
                    <span className="role-section-tag">Features</span>
                    <h2>Everything for daily operations</h2>
                    <p>Designed specifically for school canteen workflows.</p>
                </div>
                <div className="role-feature-grid">
                    {features.map((feature, index) => (
                        <div className="role-feature-card animate-on-scroll" key={feature.title} style={{ animationDelay: `${index * 0.05}s` }}>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="role-stats-section">
                <div className="role-stats-container">
                    {stats.map((stat) => (
                        <div className="role-stat-block" key={stat.label}>
                            <span className="role-stat-value">{stat.value}</span>
                            <span className="role-stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="role-cta">
                <div className="role-cta-content">
                    <h2>Ready to transform your school canteen?</h2>
                    <p>Join 100+ schools already using CanteenWallet.</p>
                    <div className="role-cta-buttons">
                        <button className="role-cta-primary" onClick={() => navigate('/parent/login')}>Parent Login</button>
                        <button className="role-cta-secondary" onClick={() => navigate('/cashier/login')}>Cashier Login</button>
                    </div>
                </div>
            </section>

            <footer className="role-footer">
                <div className="role-footer-inner">
                    <div className="role-footer-brand">
                        <div className="role-footer-logo">
                            <span className="role-logo-mark">CW</span>
                            <strong>CanteenWallet</strong>
                        </div>
                        <p>
                            A complete cashless school canteen wallet system built for parents,
                            cashiers, and administrators. Making school canteens smarter, faster,
                            and transparent.
                        </p>
                    </div>
                    <div className="role-footer-column">
                        <h4>Platform</h4>
                        <a href="#about">About</a>
                        <a href="#features">Features</a>
                        <a href="#roles">Login Portals</a>
                    </div>
                    <div className="role-footer-column">
                        <h4>System</h4>
                        <a href="#roles"><span>Parent Wallet</span></a>
                        <a href="#roles"><span>Cashier Counter</span></a>
                        <a href="#roles"><span>Admin Reports</span></a>
                    </div>
                    <div className="role-footer-column">
                        <h4>Contact</h4>
                        <a href="mailto:hello@canteenwallet.in">hello@canteenwallet.in</a>
                        <span>Panjim, Goa, India</span>
                        <span>Team Inertia Technologies</span>
                    </div>
                </div>
                <div className="role-footer-bottom">
                    <span>© 2026 CanteenWallet. All rights reserved.</span>
                    <div className="role-footer-links">
                        <a href="#about">Privacy</a>
                        <a href="#about">Terms</a>
                        <a href="#about">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default RoleSelection;