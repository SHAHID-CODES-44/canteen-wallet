const db = require('../config/db');
// Get Parent Dashboard
const getDashboard = async (req, res) => {
    try {
        const parentID = req.user.id;

        // Get balance
        let [parent] = await db.query(
            'SELECT PID, Name, Balance FROM Parent WHERE PID = ?',
            [parentID]
        );

        if (parent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent not found'
            });
        }

        // Verify and auto-fix if needed
        const [txnSum] = await db.query(
            `SELECT COALESCE(SUM(
                CASE 
                    WHEN Type IN ('TOPUP', 'ADJUSTMENT') THEN Amt 
                    WHEN Type = 'PURCHASE' THEN -Amt 
                    ELSE 0 
                END
            ), 0) as calculated FROM Transactions WHERE ParentID = ?`,
            [parentID]
        );

        let currentBalance = parseFloat(parent[0].Balance);
        const calculatedBalance = parseFloat(txnSum[0].calculated);

        if (currentBalance !== calculatedBalance) {
            // Update parent balance
            await db.query('UPDATE Parent SET Balance = ? WHERE PID = ?',
                [calculatedBalance, parentID]);

            // Refresh parent data with new balance
            [parent] = await db.query(
                'SELECT PID, Name, Balance FROM Parent WHERE PID = ?',
                [parentID]
            );
            currentBalance = calculatedBalance;
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
                balance: currentBalance,
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

// Recalculate balance from transactions
const recalculateBalance = async (req, res) => {
    try {
        const parentID = req.user.id;

        const [transactions] = await db.query(
            `SELECT Type, Amt FROM Transactions WHERE ParentID = ? ORDER BY Date_Time ASC`,
            [parentID]
        );

        let calculatedBalance = 0;
        for (const txn of transactions) {
            if (txn.Type === 'TOPUP' || txn.Type === 'ADJUSTMENT') {
                calculatedBalance += parseFloat(txn.Amt);
            } else if (txn.Type === 'PURCHASE') {
                calculatedBalance -= parseFloat(txn.Amt);
            }
        }

        // Update parent balance
        await db.query('UPDATE Parent SET Balance = ? WHERE PID = ?', [calculatedBalance, parentID]);

        return res.status(200).json({
            success: true,
            message: 'Balance recalculated',
            data: { balance: calculatedBalance }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Verify balance matches transactions
const verifyBalance = async (req, res) => {
    try {
        const parentID = req.user.id;

        // Get current balance from Parent table
        const [parent] = await db.query(
            'SELECT Balance FROM Parent WHERE PID = ?',
            [parentID]
        );

        // Calculate balance from transactions
        const [txnSum] = await db.query(
            `SELECT COALESCE(SUM(
                CASE 
                    WHEN Type IN ('TOPUP', 'ADJUSTMENT') THEN Amt 
                    WHEN Type = 'PURCHASE' THEN -Amt 
                    ELSE 0 
                END
            ), 0) as calculated FROM Transactions WHERE ParentID = ?`,
            [parentID]
        );

        const currentBalance = parseFloat(parent[0].Balance);
        const calculatedBalance = parseFloat(txnSum[0].calculated);

        const isMatching = currentBalance === calculatedBalance;

        // Auto-fix if mismatch
        if (!isMatching) {
            await db.query(
                'UPDATE Parent SET Balance = ? WHERE PID = ?',
                [calculatedBalance, parentID]
            );
        }

        return res.status(200).json({
            success: true,
            data: {
                currentBalance,
                calculatedBalance,
                isMatching,
                autoFixed: !isMatching
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

module.exports = { getDashboard, getTransactions, topUp, getLinkedStudents, recalculateBalance, verifyBalance };