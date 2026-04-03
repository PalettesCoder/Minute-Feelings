import axios from 'axios';

// Use your local backend URL for development, 
// and your public hosted backend URL for production!
const API_BASE_URL = import.meta.env.PROD 
    ? 'https://your-public-backend-url.com/api' // <-- REPLACE THIS with your hosted backend URL later!
    : 'http://localhost:5175/api'; 

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
    },
    loginWithPassword: async (credentials) => {
        // credentials: { email: '...', password: '...' }
        const { data } = await api.post('/auth/login', credentials);
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
    },
    create: async (book) => {
        const { data } = await api.post('/books', book);
        return data;
    },
    createChapter: async (bookId, chapter) => {
        const { data } = await api.post(`/books/${bookId}/chapters`, chapter);
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

export const bookmarkService = {
    getUserBookmarks: async (userId) => {
        const { data } = await api.get(`/bookmarks/${userId}`);
        return data;
    },
    create: async (userId, chapterId) => {
        const { data } = await api.post('/bookmarks', { userId, chapterId });
        return data;
    },
    delete: async (userId, chapterId) => {
        await api.delete(`/bookmarks/${userId}/${chapterId}`);
    }
};

export default api;
