const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../helpers/jwtHelper');
const { generateOTP, storeOTP, verifyOTP } = require('../helpers/otpHelper');

// Parent Login - Send OTP
const parentLogin = async (req, res) => {
    try {
        const { mobile, email } = req.body;

        if (!mobile && !email) {
            return res.status(400).json({
                success: false,
                message: 'Mobile or email is required'
            });
        }

        // Find parent
        let query = '';
        let value = '';

        if (mobile) {
            query = 'SELECT * FROM Parent WHERE MobileNum = ? AND Status = "Active"';
            value = mobile;
        } else {
            query = 'SELECT * FROM Parent WHERE EMailID = ? AND Status = "Active"';
            value = email;
        }

        const [rows] = await db.query(query, [value]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent not found'
            });
        }

        const parent = rows[0];

        // Generate OTP
        const otp = generateOTP();
        const key = `parent_${parent.PID}`;
        storeOTP(key, otp);

        // Always print to console (fallback)
        console.log(`=================================`);
        console.log(`📱 OTP for ${parent.Name}: ${otp}`);
        console.log(`=================================`);

        // Try to send email if parent has email address
        if (parent.EMailID) {
            const { sendOTPByEmail } = require('../helpers/otpHelper');
            const emailSent = await sendOTPByEmail(parent.EMailID, otp, parent.Name);
            
            if (emailSent) {
                console.log(`📧 Email OTP sent to ${parent.EMailID}`);
            } else {
                console.log(`⚠️ Email failed. OTP printed in terminal only.`);
            }
        } else {
            console.log(`⚠️ No email address found for parent. OTP printed in terminal only.`);
        }

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                pid: parent.PID,
                name: parent.Name
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

// Parent Verify OTP
const parentVerifyOTP = async (req, res) => {
    try {
        const { pid, otp } = req.body;

        if (!pid || !otp) {
            return res.status(400).json({
                success: false,
                message: 'PID and OTP are required'
            });
        }

        const key = `parent_${pid}`;
        const isValid = verifyOTP(key, otp);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Get parent details
        const [rows] = await db.query(
            'SELECT * FROM Parent WHERE PID = ?', [pid]
        );

        const parent = rows[0];

        // Generate JWT
        const token = generateToken({
            id: parent.PID,
            role: 'PARENT'
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                name: parent.Name,
                role: 'PARENT'
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

// User Login (Cashier and Admin)
const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user
        const [rows] = await db.query(
            'SELECT * FROM Users WHERE Username = ? AND Status = "Active"',
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Update last login
        await db.query(
            'UPDATE Users SET LastLogin = NOW() WHERE UserID = ?',
            [user.UserID]
        );

        // Generate JWT
        const token = generateToken({
            id: user.UserID,
            role: user.Level.toUpperCase()
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                name: user.Username,
                role: user.Level.toUpperCase()
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

module.exports = { parentLogin, parentVerifyOTP, userLogin };