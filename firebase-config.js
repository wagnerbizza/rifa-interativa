import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBu2HgZvZnAf0Di1RHup-fORZT6dRs57Bo",
  authDomain: "rifa-interativa-943ed.firebaseapp.com",
  projectId: "rifa-interativa-943ed",
  storageBucket: "rifa-interativa-943ed.firebasestorage.app",
  messagingSenderId: "369009200120",
  appId: "1:369009200120:web:62301fbbd474c9bf73e40d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);