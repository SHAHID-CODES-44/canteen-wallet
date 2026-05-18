const db = require('../config/db');

// Create Coupon
const createCoupon = async (req, res) => {
    try {
        const { studentID, items, mode } = req.body;
        const userID = req.user.id;

        if (!studentID || !items || items.length === 0 || !mode) {
            return res.status(400).json({
                success: false,
                message: 'StudentID, items and mode are required'
            });
        }

        // Get student and parent
        const [student] = await db.query(
            'SELECT s.SID, s.ParentID, p.Balance FROM Student s JOIN Parent p ON s.ParentID = p.PID WHERE s.SID = ?',
            [studentID]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const parentID = student[0].ParentID;
        const currentBalance = parseFloat(student[0].Balance);

        // Calculate total
        const total = items.reduce((sum, item) => sum + parseFloat(item.rate), 0);

        // If wallet mode check balance
        if (mode === 'Wallet' && currentBalance < total) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance'
            });
        }

        // Create coupon
        const [coupon] = await db.query(
            'INSERT INTO Coupons (StudentID, Amount, Mode, UserID) VALUES (?, ?, ?, ?)',
            [studentID, total, mode, userID]
        );

        const couponID = coupon.insertId;

        // Insert coupon items
        for (const item of items) {
            await db.query(
                'INSERT INTO Coupon_Items (CouponID, ItemID, Rate) VALUES (?, ?, ?)',
                [couponID, item.itemID, item.rate]
            );
        }

        // If wallet mode deduct balance
        if (mode === 'Wallet') {
            const newBalance = currentBalance - total;

            await db.query(
                'UPDATE Parent SET Balance = ?, LastTransactionDate = NOW() WHERE PID = ?',
                [newBalance, parentID]
            );

            await db.query(
                `INSERT INTO Transactions (ParentID, Amt, Type, ReferenceID, Balance, Status) 
                 VALUES (?, ?, 'PURCHASE', ?, ?, 'Success')`,
                [parentID, total, couponID, newBalance]
            );
        }

        return res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: {
                couponID,
                studentID,
                total,
                mode,
                items
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { createCoupon };