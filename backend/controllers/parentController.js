const db = require('../config/db');

// Get Parent Dashboard
const getDashboard = async (req, res) => {
    try {
        const parentID = req.user.id;

        // Get balance
        const [parent] = await db.query(
            'SELECT PID, Name, Balance FROM Parent WHERE PID = ?',
            [parentID]
        );

        if (parent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent not found'
            });
        }

        // Get last 5 transactions
        const [transactions] = await db.query(
            `SELECT TID, Amt, Type, Date_Time, Balance, Status 
             FROM Transactions 
             WHERE ParentID = ? 
             ORDER BY Date_Time DESC 
             LIMIT 5`,
            [parentID]
        );

        return res.status(200).json({
            success: true,
            message: 'Dashboard fetched successfully',
            data: {
                name: parent[0].Name,
                balance: parent[0].Balance,
                recentTransactions: transactions
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

// Get Full Transaction History
const getTransactions = async (req, res) => {
    try {
        const parentID = req.user.id;
        const { from, to } = req.query;

        let query = `SELECT TID, Amt, Type, Date_Time, Balance, Status 
                     FROM Transactions 
                     WHERE ParentID = ?`;
        let params = [parentID];

        if (from && to) {
            query += ' AND DATE(Date_Time) BETWEEN ? AND ?';
            params.push(from, to);
        }

        query += ' ORDER BY Date_Time DESC';

        const [transactions] = await db.query(query, params);

        return res.status(200).json({
            success: true,
            message: 'Transactions fetched successfully',
            data: transactions
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Mock Top Up
const topUp = async (req, res) => {
    try {
        const parentID = req.user.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        // Get current balance
        const [parent] = await db.query(
            'SELECT Balance FROM Parent WHERE PID = ?',
            [parentID]
        );

        const currentBalance = parseFloat(parent[0].Balance);
        const newBalance = currentBalance + parseFloat(amount);

        // Update balance
        await db.query(
            'UPDATE Parent SET Balance = ?, LastTransactionDate = NOW() WHERE PID = ?',
            [newBalance, parentID]
        );

        // Create transaction record
        await db.query(
            `INSERT INTO Transactions (ParentID, Amt, Type, Balance, Status) 
             VALUES (?, ?, 'TOPUP', ?, 'Success')`,
            [parentID, amount, newBalance]
        );

        return res.status(200).json({
            success: true,
            message: 'Top up successful',
            data: {
                amount: parseFloat(amount),
                newBalance
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

// Get Linked Students
const getLinkedStudents = async (req, res) => {
    try {
        const parentID = req.user.id;

        const [students] = await db.query(
            `SELECT s.SID, s.Name, s.PermNum,
                    cm.ClassName, dm.DivName,
                    (SELECT c.Amount FROM Coupons c 
                     WHERE c.StudentID = s.SID 
                     ORDER BY c.Date_Time_Issue DESC LIMIT 1) as LastPurchaseAmount,
                    (SELECT c.Date_Time_Issue FROM Coupons c 
                     WHERE c.StudentID = s.SID 
                     ORDER BY c.Date_Time_Issue DESC LIMIT 1) as LastPurchaseDate,
                    (SELECT SUM(c.Amount) FROM Coupons c 
                     WHERE c.StudentID = s.SID 
                     AND DATE(c.Date_Time_Issue) = CURDATE()) as TodaySpending
             FROM Student s
             JOIN Class_Master cm ON s.Class = cm.ClassID
             JOIN Division_Master dm ON s.DivID = dm.DivID
             WHERE s.ParentID = ? AND s.Status = 'Active'`,
            [parentID]
        );

        return res.status(200).json({
            success: true,
            message: 'Students fetched successfully',
            data: students
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { getDashboard, getTransactions, topUp, getLinkedStudents };