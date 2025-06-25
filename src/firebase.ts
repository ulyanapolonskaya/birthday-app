// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBP53BQEBgT8ZoX6XbBZhS1LydZ_a3_yT0",
  authDomain: "birthday-app-d90d0.firebaseapp.com",
  projectId: "birthday-app-d90d0",
  storageBucket: "birthday-app-d90d0.firebasestorage.app",
  messagingSenderId: "669484208673",
  appId: "1:669484208673:web:e3bb23be7e0af8ee058960"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 