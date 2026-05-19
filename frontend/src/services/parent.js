import API from './api';

// Get Dashboard
export const getDashboard = async () => {
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