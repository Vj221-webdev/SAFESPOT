// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // 👈 add this

const firebaseConfig = {
  apiKey: 'AIzaSyCf9KfAPY55JQlUrosA9ic2vikwDzWXY5Y',
  authDomain: 'safespot-ai.firebaseapp.com',
  projectId: 'safespot-ai',
  storageBucket: 'safespot-ai.appspot.com', // 🔹 fix this
  messagingSenderId: '388802193395',
  appId: '1:388802193395:web:1fb8a1be45520c24c69486',
  measurementId: 'G-PLBSL6NBMJ',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 👈 add this
