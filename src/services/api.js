import axios from 'axios';

const API_BASE_URL = 'http://localhost:5175/api'; // Corrected to match ASP.NET Core launchSettings

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authService = {
    sendOtp: async (identity) => {
        // identity: { phoneNumber: '...' } OR { email: '...' }
        const { data } = await api.post('/auth/send-otp', identity);
        return data; 
    },
    verifyOtp: async (identityWithCode) => {
        // identityWithCode: { phoneNumber: '...', code: '...', ...profileFields }
        const { data } = await api.post('/auth/verify-otp', identityWithCode);
        return data;
    },
    updateProfile: async (profileData) => {
        // profileData: { id: 123, hobbies: '...' }
        const { data } = await api.post('/auth/update-profile', profileData);
        return data;
    }
};


export const bookService = {
    getAll: async () => {
        const { data } = await api.get('/books');
        return data;
    },
    getBySlug: async (slug) => {
        const { data } = await api.get(`/books/${slug}`);
        return data;
    }
};

export const highlightService = {
    getUserHighlights: async (userId) => {
        const { data } = await api.get(`/highlights/${userId}`);
        return data;
    },
    create: async (userId, chapterId, text) => {
        const { data } = await api.post('/highlights', { userId, chapterId, text });
        return data;
    },
    delete: async (id) => {
        await api.delete(`/highlights/${id}`);
    }
};

export default api;
