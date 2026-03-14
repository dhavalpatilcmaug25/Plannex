import api from './api';

const miscService = {
    getServices: async () => {
        const response = await api.get('/misc/services');
        return response.data;
    },
    getLocations: async () => {
        const response = await api.get('/misc/locations');
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/stats');
        return response.data;
    }
};

export default miscService;
