import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCEGLLyHqpmsqD9ipVs2sQZYTQ84fo9Sn4',
  authDomain: 'minutefeelings.firebaseapp.com',
  projectId: 'minutefeelings',
  storageBucket: 'minutefeelings.firebasestorage.app',
  messagingSenderId: '818346747129',
  appId: '1:818346747129:web:7552a088bce1caf7346e28',
  measurementId: 'G-YYHTEXZ6XQ',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export let analytics = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp);
    }
  });
}
