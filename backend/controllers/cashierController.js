const db = require('../config/db');

// Search Student
const searchStudent = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const [students] = await db.query(
            `SELECT s.SID, s.Name, s.PermNum,
                    cm.ClassName, dm.DivName,
                    p.Balance, p.PID
             FROM Student s
             JOIN Parent p ON s.ParentID = p.PID
             JOIN Class_Master cm ON s.Class = cm.ClassID
             JOIN Division_Master dm ON s.DivID = dm.DivID
             WHERE (s.PermNum = ? OR s.Name LIKE ?)
             AND s.Status = 'Active'`,
            [q, `%${q}%`]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No student found'
            });
        }

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

// Get Student Balance
const getStudentBalance = async (req, res) => {
    try {
        const { id } = req.params;

        const [student] = await db.query(
            `SELECT s.SID, s.Name, s.PermNum,
                    cm.ClassName, dm.DivName,
                    p.Balance, p.PID, p.Name as ParentName
             FROM Student s
             JOIN Parent p ON s.ParentID = p.PID
             JOIN Class_Master cm ON s.Class = cm.ClassID
             JOIN Division_Master dm ON s.DivID = dm.DivID
             WHERE s.SID = ? AND s.Status = 'Active'`,
            [id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student fetched successfully',
            data: student[0]
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get Stations
const getStations = async (req, res) => {
    try {
        const stations = [
            { id: 1, name: 'Counter 1' },
            { id: 2, name: 'Counter 2' },
            { id: 3, name: 'Counter 3' },
            { id: 4, name: 'Counter 4' },
        ];

        return res.status(200).json({
            success: true,
            message: 'Stations fetched successfully',
            data: stations
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get Day Summary
const getDaySummary = async (req, res) => {
    try {
        // Overall summary
        const [summary] = await db.query(
            `SELECT 
                COUNT(c.CouponID) as TotalCoupons,
                SUM(CASE WHEN c.Mode = 'Wallet' THEN c.Amount ELSE 0 END) as WalletTotal,
                SUM(CASE WHEN c.Mode = 'Cash' THEN c.Amount ELSE 0 END) as CashTotal,
                SUM(c.Amount) as GrandTotal
             FROM Coupons c
             WHERE DATE(c.Date_Time_Issue) = CURDATE()
             AND c.Status = 'Issued'`
        );

        // Item wise summary
        const [items] = await db.query(
            `SELECT 
                m.Name as ItemName,
                COUNT(ci.CouponItemID) as QuantitySold,
                SUM(ci.Rate) as TotalRevenue
             FROM Coupon_Items ci
             JOIN Menu m ON ci.ItemID = m.ItemID
             JOIN Coupons c ON ci.CouponID = c.CouponID
             WHERE DATE(c.Date_Time_Issue) = CURDATE()
             AND c.Status = 'Issued'
             GROUP BY m.ItemID, m.Name
             ORDER BY QuantitySold DESC`
        );

        return res.status(200).json({
            success: true,
            message: 'Day summary fetched successfully',
            data: {
                summary: summary[0],
                itemWise: items
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

module.exports = { searchStudent, getStudentBalance, getStations, getDaySummary };