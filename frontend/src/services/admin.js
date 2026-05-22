import API from './api';

export const adminLogin = async (data) => {
    const response = await API.post('/auth/user/login', data);
    return response.data;
};

export const getAdminDashboard = async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
};

export const getDeposits = async () => {
    const response = await API.get('/admin/deposits');
    return response.data;
};

export const manualTopUp = async (data) => {
    const response = await API.post('/admin/manual-topup', data);
    return response.data;
};

export const getSalesReport = async (from, to) => {
    let url = '/admin/sales';
    if (from && to) url += `?from=${from}&to=${to}`;
    const response = await API.get(url);
    return response.data;
};

export const getUsers = async () => {
    const response = await API.get('/admin/users');
    return response.data;
};

export const createUser = async (data) => {
    const response = await API.post('/admin/users', data);
    return response.data;
};

export const getMenu = async () => {
    const response = await API.get('/menu');
    return response.data;
};

export const addMenuItem = async (data) => {
    const response = await API.post('/menu', data);
    return response.data;
};

export const updateMenuItem = async (id, data) => {
    const response = await API.put(`/menu/${id}`, data);
    return response.data;
};

export const updateMenuStatus = async (id, status) => {
    const response = await API.put(`/menu/${id}/status`, { status });
    return response.data;
};

export const getStudents = async () => {
    const response = await API.get('/admin/students');
    return response.data;
};