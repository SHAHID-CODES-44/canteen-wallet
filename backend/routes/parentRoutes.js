const express = require('express');
const router = express.Router();
const { getDashboard, getTransactions, topUp, getLinkedStudents } = require('../controllers/parentController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, allowRoles('PARENT'), getDashboard);
router.get('/transactions', protect, allowRoles('PARENT'), getTransactions);
router.post('/topup', protect, allowRoles('PARENT'), topUp);
router.get('/students', protect, allowRoles('PARENT'), getLinkedStudents);

module.exports = router;