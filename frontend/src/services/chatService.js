import api from './api';

const chatService = {
    getMessages: async (otherUserId) => {
        const response = await api.get(`/chat/${otherUserId}`);
        return response.data;
    },
    sendMessage: async (message) => {
        const response = await api.post('/chat', message);
        return response.data;
    },
    getConversations: async () => {
        const response = await api.get('/chat/conversations');
        return response.data;
    }
};

export default chatService;
