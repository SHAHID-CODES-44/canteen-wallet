const express = require('express');
const router = express.Router();
const { getMenu, addMenuItem, updateMenuItem, updateMenuStatus } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, allowRoles('CASHIER', 'ADMIN'), getMenu);
router.post('/', protect, allowRoles('ADMIN'), addMenuItem);
router.put('/:id', protect, allowRoles('ADMIN'), updateMenuItem);
router.put('/:id/status', protect, allowRoles('ADMIN'), updateMenuStatus);

module.exports = router;