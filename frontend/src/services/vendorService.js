import api from './api';

const vendorService = {
    getVendors: async () => {
        const response = await api.get('/vendor');
        return response.data;
    },
    getVendor: async (id) => {
        const response = await api.get(`/vendor/${id}`);
        return response.data;
    },
    createVendorProfile: async (profileData) => {
        const response = await api.post('/vendor', profileData);
        return response.data;
    },
    updateVendorProfile: async (id, profileData) => {
        const response = await api.put(`/vendor/${id}`, profileData);
        return response.data;
    },
    getMyProfile: async () => {
        const response = await api.get('/vendor/my-profile');
        return response.data;
    },
    getVendorStats: async () => {
        const response = await api.get('/stats/vendor-stats');
        return response.data;
    },
    addPortfolioImage: async (imageUrl) => {
        const response = await api.post('/vendor/portfolio', { imageUrl });
        return response.data;
    },
    removePortfolioImage: async (imageId) => {
        const response = await api.delete(`/vendor/portfolio/${imageId}`);
        return response.data;
    }
};

export default vendorService;
