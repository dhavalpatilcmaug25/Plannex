import api from './api';

const adminService = {
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    approveVendor: async (id) => {
        const response = await api.put(`/admin/vendors/${id}/approve`);
        return response.data;
    },
    rejectVendor: async (id) => {
        const response = await api.put(`/admin/vendors/${id}/reject`);
        return response.data;
    },
    suspendUser: async (id) => {
        const response = await api.put(`/admin/users/${id}/suspend`);
        return response.data;
    },
    reactivateUser: async (id) => {
        const response = await api.put(`/admin/users/${id}/reactivate`);
        return response.data;
    },
    getSystemStats: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
    getAllBookings: async () => {
        const response = await api.get('/admin/bookings');
        return response.data;
    }
};

export default adminService;
