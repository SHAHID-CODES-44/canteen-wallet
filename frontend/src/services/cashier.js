import API from './api';

// Get all stations/counters for cashier selection
export const getStations = async () => {
    const response = await API.get('/students/stations');
    return response.data;
};

// Search student by barcode, ID, or name
export const searchStudent = async (query) => {
    const response = await API.get(`/students/search?q=${encodeURIComponent(query)}`);
    return response.data;
};

// Get student details with parent balance
export const getStudentBalance = async (studentId) => {
    const response = await API.get(`/students/${studentId}/balance`);
    return response.data;
};

// Get all active menu items
export const getMenu = async () => {
    const response = await API.get('/menu');
    return response.data;
};

// Create a new coupon (purchase)
export const createCoupon = async (data) => {
    const response = await API.post('/coupons', data);
    return response.data;
};

// Get day summary for current shift
export const getDaySummary = async () => {
    const response = await API.get('/students/day-summary');
    return response.data;
};