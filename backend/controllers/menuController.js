const db = require('../config/db');

// Get All Active Menu Items
const getMenu = async (req, res) => {
    try {
        const [items] = await db.query(
            'SELECT ItemID, Name, Rate FROM Menu WHERE Status = "Active" ORDER BY Name ASC'
        );

        return res.status(200).json({
            success: true,
            message: 'Menu fetched successfully',
            data: items
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Add Menu Item
const addMenuItem = async (req, res) => {
    try {
        const { name, rate } = req.body;

        if (!name || !rate) {
            return res.status(400).json({
                success: false,
                message: 'Name and rate are required'
            });
        }

        await db.query(
            'INSERT INTO Menu (Name, Rate) VALUES (?, ?)',
            [name, rate]
        );

        return res.status(201).json({
            success: true,
            message: 'Menu item added successfully'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update Menu Item
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rate } = req.body;

        await db.query(
            'UPDATE Menu SET Name = ?, Rate = ? WHERE ItemID = ?',
            [name, rate, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Menu item updated successfully'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Update Menu Item Status
const updateMenuStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await db.query(
            'UPDATE Menu SET Status = ? WHERE ItemID = ?',
            [status, id]
        );

        return res.status(200).json({
            success: true,
            message: 'Menu item status updated successfully'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { getMenu, addMenuItem, updateMenuItem, updateMenuStatus };