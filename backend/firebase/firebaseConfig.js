// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB3sRLZq50DyO4NMuBIkR2ORq5XXWl8YuQ",
  authDomain: "21co.firebaseapp.com",
  projectId: "co-7aa0b",
  storageBucket: "21co.appspot.com",
  messagingSenderId: "510782989783",
  appId: "1:510782989783:web:1485919b80d809d7e1d792"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };