const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get Admin Dashboard
const getDashboard = async (req, res) => {
    try {
        const [parents] = await db.query('SELECT COUNT(*) as total FROM Parent WHERE Status = "Active"');
        const [students] = await db.query('SELECT COUNT(*) as total FROM Student WHERE Status = "Active"');
        const [todaySales] = await db.query(
            `SELECT SUM(Amount) as total FROM Coupons 
             WHERE DATE(Date_Time_Issue) = CURDATE() AND Status = 'Issued'`
        );
        const [totalBalance] = await db.query('SELECT SUM(Balance) as total FROM Parent WHERE Status = "Active"');

        return res.status(200).json({
            success: true,
            message: 'Admin dashboard fetched successfully',
            data: {
                totalParents: parents[0].total,
                totalStudents: students[0].total,
                todaySales: todaySales[0].total || 0,
                totalBalance: totalBalance[0].total || 0
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

// Get Deposit Overview
const getDeposits = async (req, res) => {
    try {
        const [parents] = await db.query(
            `SELECT PID, Name, MobileNum, EMailID, Balance, LastTransactionDate 
             FROM Parent WHERE Status = "Active" ORDER BY Balance ASC`
        );

        return res.status(200).json({
            success: true,
            message: 'Deposits fetched successfully',
            data: parents
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Manual Top Up
const manualTopUp = async (req, res) => {
    try {
        const { parentID, amount, note } = req.body;

        if (!parentID || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ParentID and valid amount are required'
            });
        }

        const [parent] = await db.query(
            'SELECT Balance FROM Parent WHERE PID = ?', [parentID]
        );

        if (parent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent not found'
            });
        }

        const newBalance = parseFloat(parent[0].Balance) + parseFloat(amount);

        await db.query(
            'UPDATE Parent SET Balance = ?, LastTransactionDate = NOW() WHERE PID = ?',
            [newBalance, parentID]
        );

        await db.query(
            `INSERT INTO Transactions (ParentID, Amt, Type, Balance, Status) 
             VALUES (?, ?, 'ADJUSTMENT', ?, 'Success')`,
            [parentID, amount, newBalance]
        );

        return res.status(200).json({
            success: true,
            message: 'Manual top up successful',
            data: { newBalance }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get Sales Report
const getSales = async (req, res) => {
    try {
        const { from, to } = req.query;

        let dateFilter = 'DATE(c.Date_Time_Issue) = CURDATE()';
        let params = [];

        if (from && to) {
            dateFilter = 'DATE(c.Date_Time_Issue) BETWEEN ? AND ?';
            params = [from, to];
        }

        const [items] = await db.query(
            `SELECT 
                m.Name as ItemName,
                COUNT(ci.CouponItemID) as QuantitySold,
                SUM(ci.Rate) as TotalRevenue
             FROM Coupon_Items ci
             JOIN Menu m ON ci.ItemID = m.ItemID
             JOIN Coupons c ON ci.CouponID = c.CouponID
             WHERE ${dateFilter} AND c.Status = 'Issued'
             GROUP BY m.ItemID, m.Name
             ORDER BY QuantitySold DESC`,
            params
        );

       const [total] = await db.query(
    `SELECT SUM(Amount) as GrandTotal 
     FROM Coupons 
     WHERE ${dateFilter.replace('c.Date_Time_Issue', 'Date_Time_Issue')} AND Status = 'Issued'`,
    params
);

        return res.status(200).json({
            success: true,
            message: 'Sales report fetched successfully',
            data: {
                items,
                grandTotal: total[0].GrandTotal || 0
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

// Get All Users
const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT UserID, Username, Level, LastLogin, Status FROM Users ORDER BY Level ASC'
        );

        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Create New User
const createUser = async (req, res) => {
    try {
        const { username, password, level } = req.body;

        if (!username || !password || !level) {
            return res.status(400).json({
                success: false,
                message: 'Username, password and level are required'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO Users (Username, PasswordHash, Level) VALUES (?, ?, ?)',
            [username, hash, level]
        );

        return res.status(201).json({
            success: true,
            message: 'User created successfully'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get All Students
const getStudents = async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT s.SID, s.Name, s.PermNum,
                    cm.ClassName, dm.DivName,
                    p.Name as ParentName
             FROM Student s
             JOIN Class_Master cm ON s.Class = cm.ClassID
             JOIN Division_Master dm ON s.DivID = dm.DivID
             JOIN Parent p ON s.ParentID = p.PID
             WHERE s.Status = 'Active'
             ORDER BY s.Name ASC`
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

module.exports = { 
    getDashboard, 
    getDeposits, 
    manualTopUp, 
    getSales, 
    getUsers, 
    createUser,
    getStudents
};