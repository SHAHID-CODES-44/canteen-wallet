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

module.exports = { generateOTP, storeOTP, verifyOTP };