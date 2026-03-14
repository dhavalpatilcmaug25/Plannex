import api from './api';

const bookingService = {
    createBooking: async (bookingData) => {
        const response = await api.post('/booking', bookingData);
        return response.data;
    },

    getBooking: async (id) => {
        const response = await api.get(`/booking/${id}`);
        return response.data;
    },
    getMyBookings: async () => {
        const response = await api.get('/booking/my-bookings');
        return response.data;
    },
    updateStatus: async (id, status) => {
        // Sending string as JSON
        const response = await api.put(`/booking/${id}/status`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
};

export default bookingService;
