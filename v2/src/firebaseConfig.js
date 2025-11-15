import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getLogic } from "firebase/ai";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeHzzscjrfH3QEyS9cpFWvUdvukfIlvPM",
  authDomain: "sigjeof.firebaseapp.com",
  projectId: "sigjeof",
  storageBucket: "sigjeof.appspot.com",
  messagingSenderId: "799693717051",
  appId: "1:799693717051:web:723b3a412422f7cc5ae61e",
  measurementId: "G-JRWEJZSGY1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (only in browsers)
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const aiLogic = getLogic(app);

// Do not export `auth` here — code should use firebase/auth and onAuthStateChanged directly
export default app;
