import api from './api';

const eventService = {
    getAllEvents: async (params) => {
        const response = await api.get('/event', { params });
        return response.data;
    },
    createEvent: async (eventData) => {
        const response = await api.post('/event', eventData);
        return response.data;
    },
    getMyEvents: async () => {
        const response = await api.get('/event/my-events');
        return response.data;
    },
    applyToEvent: async (eventId, price) => {
        const response = await api.post(`/event/${eventId}/apply`, { price });
        return response.data;
    },
    updateApplicationStatus: async (eventId, appId, status) => {
        // Sending raw string with quotes as JSON
        const response = await api.put(`/event/${eventId}/applications/${appId}/status`, JSON.stringify(status), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
};

export default eventService;
