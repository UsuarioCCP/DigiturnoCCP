// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGUOf4jj9NC8kH0Xb7iwOS0aFG_LBuF2Y",
  authDomain: "digiturno-b006f.firebaseapp.com",
  projectId: "digiturno-b006f",
  storageBucket: "digiturno-b006f.firebasestorage.app",
  messagingSenderId: "467996029540",
  appId: "1:467996029540:web:87a5b26c06455e17596571",
  measurementId: "G-4WD4CGTZQC"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };


