// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBEljUtCV0P-4mdlPL0bb53CSuNnbltNEQ",
  authDomain: "odessa-app-b3a93.firebaseapp.com",
  projectId: "odessa-app-b3a93",
  storageBucket: "odessa-app-b3a93.firebasestorage.app",
  messagingSenderId: "106896150241",
  appId: "1:106896150241:web:61feff9e2e7f85c9a4f1a0",
  measurementId: "G-JEZXZ867CD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
