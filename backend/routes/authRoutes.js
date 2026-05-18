const express = require('express');
const router = express.Router();
const { parentLogin, parentVerifyOTP, userLogin } = require('../controllers/authController');

router.post('/parent/login', parentLogin);
router.post('/parent/verify-otp', parentVerifyOTP);
router.post('/user/login', userLogin);

module.exports = router;