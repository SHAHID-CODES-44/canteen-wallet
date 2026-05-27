import API from './api';

// Get Dashboard
export const getDashboard = async () => {
    console.log('getDashboard called, token:', localStorage.getItem('token') ? 'Yes' : 'No');
    const response = await API.get('/parent/dashboard');
    return response.data;
};

// Get Transactions
export const getTransactions = async () => {
    const response = await API.get('/parent/transactions');
    return response.data;
};

// Top Up
export const topUp = async (amount) => {
    const response = await API.post('/parent/topup', { amount });
    return response.data;
};

// Get Linked Students
export const getLinkedStudents = async () => {
    const response = await API.get('/parent/students');
    return response.data;
};

// Verify Pin for Transaction
export const verifyTransactionPin = async (data) => {
    const response = await API.post('/auth/parent/verify-pin', data);
    return response.data;
};

// Check if Having Pin
export const checkHasPin = async (data) => {
    const response = await API.post('/auth/parent/check-pin', data);
    return response.data;
};

// Set Pin for Topup
export const setTransactionPin = async (data) => {
    const response = await API.post('/auth/parent/set-pin', data);
    return response.data;
};