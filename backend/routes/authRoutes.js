const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    parentLogin, 
    parentVerifyOTP, 
    parentSignup,
    parentPasswordLogin,
    setPassword,
    userLogin,
    verifyTransactionPin,
    checkHasPin,
    setTransactionPin
} = require('../controllers/authController');

// Parent routes
router.post('/parent/login', parentLogin);
router.post('/parent/verify-otp', parentVerifyOTP);
router.post('/parent/signup', parentSignup);
router.post('/parent/password-login', parentPasswordLogin);
router.post('/parent/set-password', protect, setPassword);
router.post('/parent/verify-pin', protect, verifyTransactionPin);
router.post('/parent/check-pin', protect, checkHasPin);
router.post('/parent/set-pin', protect, setTransactionPin);

// Cashier/Admin login
router.post('/user/login', userLogin);

module.exports = router;