// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB3sRLZq50DyO4NMuBIkR2ORq5XXWl8YuQ",
  authDomain: "SENİN_PROJE.firebaseapp.com",
  projectId: "SENİN_PROJE_ID",
  storageBucket: "SENİN_PROJE.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };