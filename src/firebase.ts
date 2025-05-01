import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvfbBNFa-oLjSTd710TwHKgHext_Ylykc",
  authDomain: "uot-lectures.firebaseapp.com",
  projectId: "uot-lectures",
  storageBucket: "uot-lectures.firebasestorage.app",
  messagingSenderId: "372576135813",
  appId: "1:372576135813:web:e260dfab90728063ea17ec",
  measurementId: "G-DKER502XJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;