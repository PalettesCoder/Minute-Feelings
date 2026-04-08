import axios from 'axios';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
} from 'firebase/firestore';
import { db } from '../firebase';

// Use your local backend URL for development, 
// and your public hosted backend URL for production!
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
    || (import.meta.env.PROD ? '/api' : 'http://localhost:5175/api');

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
        const booksSnap = await getDocs(query(collection(db, 'books'), orderBy('title')));

        const books = await Promise.all(
            booksSnap.docs.map(async (bookDoc) => {
                const bookData = bookDoc.data();
                const chaptersSnap = await getDocs(
                    query(collection(db, 'books', bookDoc.id, 'chapters'), orderBy('createdAt'))
                );

                const chapters = chaptersSnap.docs.map((chDoc, idx) => {
                    const chData = chDoc.data();
                    return {
                        id: chData.id ?? idx + 1,
                        title: chData.title || 'Untitled Chapter',
                        meta: chData.meta || '',
                        contentJson: chData.contentJson || JSON.stringify(chData.content || []),
                    };
                });

                return {
                    id: bookDoc.id,
                    slug: bookData.slug,
                    title: bookData.title,
                    subtitle: bookData.subtitle || '',
                    coverColor: bookData.coverColor || '#5d4037',
                    author: bookData.author || 'Unknown',
                    chapters,
                };
            })
        );

        return books;
    },
    getBySlug: async (slug) => {
        const bookSnap = await getDocs(query(collection(db, 'books'), where('slug', '==', slug), limit(1)));
        if (bookSnap.empty) return null;

        const bookDoc = bookSnap.docs[0];
        const bookData = bookDoc.data();
        const chaptersSnap = await getDocs(
            query(collection(db, 'books', bookDoc.id, 'chapters'), orderBy('createdAt'))
        );

        const chapters = chaptersSnap.docs.map((chDoc, idx) => {
            const chData = chDoc.data();
            return {
                id: chData.id ?? idx + 1,
                title: chData.title || 'Untitled Chapter',
                meta: chData.meta || '',
                contentJson: chData.contentJson || JSON.stringify(chData.content || []),
            };
        });

        return {
            id: bookDoc.id,
            slug: bookData.slug,
            title: bookData.title,
            subtitle: bookData.subtitle || '',
            coverColor: bookData.coverColor || '#5d4037',
            author: bookData.author || 'Unknown',
            chapters,
        };
    },
    create: async (book) => {
        const payload = {
            ...book,
            createdAt: serverTimestamp(),
        };
        const ref = await addDoc(collection(db, 'books'), payload);
        return { id: ref.id, ...book };
    },
    createChapter: async (bookId, chapter) => {
        const chapterPayload = {
            ...chapter,
            createdAt: serverTimestamp(),
        };
        const ref = await addDoc(collection(db, 'books', String(bookId), 'chapters'), chapterPayload);
        return { id: ref.id, ...chapter };
    }
};

export const highlightService = {
    getUserHighlights: async (userId) => {
        const q = query(
            collection(db, 'highlights'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                userId: data.userId,
                chapterId: data.chapterId,
                text: data.text,
                date: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
            };
        });
    },
    create: async (userId, chapterId, text) => {
        const ref = await addDoc(collection(db, 'highlights'), {
            userId,
            chapterId,
            text,
            createdAt: serverTimestamp(),
        });
        return { id: ref.id, userId, chapterId, text };
    },
    delete: async (id) => {
        await deleteDoc(doc(db, 'highlights', String(id)));
    }
};

export const bookmarkService = {
    getUserBookmarks: async (userId) => {
        const q = query(
            collection(db, 'bookmarks'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                userId: data.userId,
                chapterId: data.chapterId,
            };
        });
    },
    create: async (userId, chapterId) => {
        const ref = await addDoc(collection(db, 'bookmarks'), {
            userId,
            chapterId,
            createdAt: serverTimestamp(),
        });
        return { id: ref.id, userId, chapterId };
    },
    delete: async (userId, chapterId) => {
        const q = query(
            collection(db, 'bookmarks'),
            where('userId', '==', userId),
            where('chapterId', '==', chapterId),
            limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            await deleteDoc(doc(db, 'bookmarks', snap.docs[0].id));
        }
    }
};

export default api;
