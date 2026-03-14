import api from './api';

const applicationService = {
    // Send a request to a vendor
    sendRequest: async (data) => {
        const response = await api.post('/applications', data);
        return response.data;
    },

    // Get outgoing requests (for customer)
    getUserApplications: async () => {
        const response = await api.get('/applications/user');
        return response.data;
    },

    // Get incoming requests (for vendor)
    getVendorApplications: async () => {
        const response = await api.get('/applications/vendor');
        return response.data;
    },

    // Update status (Approve/Reject)
    updateStatus: async (id, status) => {
        const response = await api.put(`/applications/${id}/status`, { status });
        return response.data;
    }
};

export default applicationService;
