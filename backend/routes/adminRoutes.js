const express = require('express');
const router = express.Router();
const { 
    getDashboard, 
    getDeposits, 
    manualTopUp, 
    getSales, 
    getUsers, 
    createUser,
    getStudents
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, allowRoles('ADMIN'), getDashboard);
router.get('/deposits', protect, allowRoles('ADMIN'), getDeposits);
router.post('/manual-topup', protect, allowRoles('ADMIN'), manualTopUp);
router.get('/sales', protect, allowRoles('ADMIN'), getSales);
router.get('/users', protect, allowRoles('ADMIN'), getUsers);
router.post('/users', protect, allowRoles('ADMIN'), createUser);
router.get('/students', protect, allowRoles('ADMIN'), getStudents);

module.exports = router;