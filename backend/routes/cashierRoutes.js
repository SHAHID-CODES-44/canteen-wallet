const express = require('express');
const router = express.Router();
const { searchStudent, getStudentBalance, getStations, getDaySummary } = require('../controllers/cashierController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/search', protect, allowRoles('CASHIER'), searchStudent);
router.get('/:id/balance', protect, allowRoles('CASHIER'), getStudentBalance);
router.get('/stations', protect, allowRoles('CASHIER'), getStations);
router.get('/day-summary', protect, allowRoles('CASHIER'), getDaySummary);

module.exports = router;