import API from './api';

// Parent Login - Send OTP
export const parentLogin = async (data) => {
    const response = await API.post('/auth/parent/login', data);
    return response.data;
};

// Parent Verify OTP
export const verifyOTP = async (data) => {
    const response = await API.post('/auth/parent/verify-otp', data);
    return response.data;
};

// Cashier / Admin Login
export const userLogin = async (data) => {
    const response = await API.post('/auth/user/login', data);
    return response.data;
};