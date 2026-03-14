import api from './api';

const reviewService = {
    getMyReviews: async () => {
        const response = await api.get('/review/my-reviews');
        return response.data;
    },
    postReview: async (reviewData) => {
        const response = await api.post('/review', reviewData);
        return response.data;
    },
    getVendorReviews: async (vendorId) => {
        const response = await api.get(`/review/vendor/${vendorId}`);
        return response.data;
    },
    getAllReviews: async () => {
        const response = await api.get('/review/all');
        return response.data;
    }
};

export default reviewService;
