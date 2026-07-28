// Firebase App Initializer
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6nWfDe6uZL1KoLrcPTPiS5zyipxF_G5Q",
  authDomain: "college-memories-b8c6b.firebaseapp.com",
  projectId: "college-memories-b8c6b",
  storageBucket: "college-memories-b8c6b.firebasestorage.app",
  messagingSenderId: "1041077451839",
  appId: "1:1041077451839:web:365b61b8168ec880f9cc8a",
  measurementId: "G-J041Z8BDK5"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);