// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👉 Ton config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAPQWV_7-ReK6ttogb23hBW3BDkCOnKC90",
  authDomain: "scolaire-ce749.firebaseapp.com",
  projectId: "scolaire-ce749",
  storageBucket: "scolaire-ce749.firebasestorage.app",
  messagingSenderId: "719726119042",
  appId: "1:719726119042:web:636af33c3bbd2f6b700c9b",
  measurementId: "G-H39X0B9K7E"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services utiles
export const auth = getAuth(app);
export const db = getFirestore(app);
