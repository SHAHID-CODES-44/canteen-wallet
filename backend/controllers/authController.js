const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../helpers/jwtHelper');
const { generateOTP, storeOTP, verifyOTP, sendOTPByEmail } = require('../helpers/otpHelper');

// ========== PARENT OTP LOGIN (EXISTING) ==========
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

        console.log(`=================================`);
        console.log(`📱 OTP for ${parent.Name}: ${otp}`);
        console.log(`=================================`);

        // Try to send email if parent has email address
        if (parent.EMailID) {
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

// ========== PARENT OTP VERIFY (EXISTING) ==========
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

        const [rows] = await db.query('SELECT * FROM Parent WHERE PID = ?', [pid]);
        const parent = rows[0];

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
// ========== PARENT SIGNUP (NEW) ==========
const parentSignup = async (req, res) => {
    try {
        const { name, mobile, email, password, transactionPin } = req.body;

        if (!name || !mobile || !email || !password || !transactionPin) {
            return res.status(400).json({
                success: false,
                message: 'All fields including transaction PIN are required'
            });
        }

        if (transactionPin.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Transaction PIN must be at least 4 digits'
            });
        }

        // Check if parent already exists
        const [existing] = await db.query(
            'SELECT * FROM Parent WHERE MobileNum = ? OR EMailID = ?',
            [mobile, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Parent already registered with this mobile or email'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Hash transaction PIN
        const pinHash = await bcrypt.hash(transactionPin, salt);

        // Insert new parent
        const [result] = await db.query(
            `INSERT INTO Parent (Name, MobileNum, EMailID, PasswordHash, TransactionPin, Balance, Status) 
             VALUES (?, ?, ?, ?, ?, 0, 'Active')`,
            [name, mobile, email, passwordHash, pinHash]
        );

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Please login.',
            data: { pid: result.insertId }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
// ========== VERIFY TRANSACTION PIN FOR TOP-UP ==========
const verifyTransactionPin = async (req, res) => {
    try {
        const { pid, pin } = req.body;

        if (!pid || !pin) {
            return res.status(400).json({
                success: false,
                message: 'PIN is required'
            });
        }

        const [rows] = await db.query('SELECT TransactionPin FROM Parent WHERE PID = ?', [pid]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Parent not found'
            });
        }

        const parent = rows[0];

        if (!parent.TransactionPin) {
            return res.status(400).json({
                success: false,
                message: 'Transaction PIN not set. Please set it first.'
            });
        }

        const isMatch = await bcrypt.compare(pin, parent.TransactionPin);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid transaction PIN'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'PIN verified successfully'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ========== PARENT PASSWORD LOGIN (NEW) ==========
const parentPasswordLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const [rows] = await db.query(
            'SELECT * FROM Parent WHERE EMailID = ? AND Status = "Active"',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const parent = rows[0];

        if (!parent.PasswordHash) {
            return res.status(401).json({
                success: false,
                message: 'Please use OTP login to set your password first'
            });
        }

        const isMatch = await bcrypt.compare(password, parent.PasswordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

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
                role: 'PARENT',
                pid: parent.PID
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

// ========== SET PASSWORD FOR EXISTING PARENT (NEW) ==========
const setPassword = async (req, res) => {
    try {
        const { pid, password } = req.body;

        if (!pid || !password) {
            return res.status(400).json({
                success: false,
                message: 'PID and password are required'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await db.query(
            'UPDATE Parent SET PasswordHash = ? WHERE PID = ?',
            [passwordHash, pid]
        );

        return res.status(200).json({
            success: true,
            message: 'Password set successfully'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ========== CASHIER / ADMIN LOGIN (EXISTING) ==========
const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

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
        const isMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        await db.query('UPDATE Users SET LastLogin = NOW() WHERE UserID = ?', [user.UserID]);

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

// Check if parent has transaction PIN set
const checkHasPin = async (req, res) => {
    try {
        const { pid } = req.body;
        
        const [rows] = await db.query('SELECT TransactionPin FROM Parent WHERE PID = ?', [pid]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent not found' });
        }
        
        const hasPin = rows[0].TransactionPin !== null;
        
        return res.status(200).json({
            success: true,
            data: { hasPin }
        });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Set transaction PIN for existing user
const setTransactionPin = async (req, res) => {
    try {
        const { pid, pin } = req.body;
        
        if (!pin || pin.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'PIN must be at least 4 digits'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const pinHash = await bcrypt.hash(pin, salt);
        
        await db.query('UPDATE Parent SET TransactionPin = ? WHERE PID = ?', [pinHash, pid]);
        
        return res.status(200).json({
            success: true,
            message: 'Transaction PIN set successfully'
        });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { 
    parentLogin, 
    parentVerifyOTP, 
    parentSignup,
    parentPasswordLogin,
    setPassword,
    verifyTransactionPin,
    userLogin,
    checkHasPin,
    setTransactionPin
};