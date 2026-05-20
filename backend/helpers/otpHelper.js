const nodemailer = require('nodemailer');

const otps = {};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = (key, otp) => {
    otps[key] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };
};

const verifyOTP = (key, otp) => {
    const record = otps[key];
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
        delete otps[key];
        return false;
    }
    if (record.otp !== otp) return false;
    delete otps[key];
    return true;
};

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Send OTP via email
const sendOTPByEmail = async (toEmail, otp, parentName) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"CanteenWallet" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Your CanteenWallet OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px;">
                    <h2 style="color: #4A90D9;">CanteenWallet</h2>
                    <p>Hello ${parentName},</p>
                    <p>Your One-Time Password (OTP) for login is:</p>
                    <h1 style="color: #4A90D9; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr />
                    <p style="font-size: 12px; color: #888;">CanteenWallet - Cashless School Canteen System</p>
                </div>
            `
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email OTP sent to ${toEmail}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error.message);
        return false;
    }
};

// For terminal fallback (prints OTP)
const printOTPToConsole = (parentName, otp) => {
    console.log(`=================================`);
    console.log(`📱 OTP for ${parentName}: ${otp}`);
    console.log(`📧 Email would be sent in production`);
    console.log(`=================================`);
};

module.exports = { 
    generateOTP, 
    storeOTP, 
    verifyOTP, 
    sendOTPByEmail,
    printOTPToConsole
};