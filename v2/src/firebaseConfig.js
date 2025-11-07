import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeHzzscjrfH3QEyS9cpFWvUdvukfIlvPM",
  authDomain: "sigjeof.firebaseapp.com",
  projectId: "sigjeof",
  storageBucket: "sigjeof.appspot.com", // fixed: should be *.appspot.com
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
