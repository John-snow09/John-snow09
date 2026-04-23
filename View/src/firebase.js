// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ 1. Import Firestore

// 👇 paste your config here
const firebaseConfig = {
  apiKey: "AIzaSyDJC1x5h2ShFUm6ld-wem2cp5OSMp5tFOM",
  authDomain: "snowlabs-efc35.firebaseapp.com",
  projectId: "snowlabs-efc35",
  storageBucket: "snowlabs-efc35.firebasestorage.app",
  messagingSenderId: "773848118964",
  appId: "1:773848118964:web:8618ea294800c163f389e1",
  measurementId: "G-DZ9ZT8VEQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app); // ✅ 2. Initialize and Export db