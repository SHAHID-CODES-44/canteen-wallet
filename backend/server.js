const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

dotenv.config();

const app = express();

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'CanteenWallet API is running!'
    });
});

// Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/parent', require('./routes/parentRoutes'));
app.use('/api/v1/students', require('./routes/cashierRoutes'));
app.use('/api/v1/menu', require('./routes/menuRoutes'));
app.use('/api/v1/coupons', require('./routes/couponRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`CanteenWallet server running on port ${PORT}`);
    
    
});