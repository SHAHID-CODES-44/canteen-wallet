const express = require('express');
const router = express.Router();
const { createCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, allowRoles('CASHIER'), createCoupon);

module.exports = router;