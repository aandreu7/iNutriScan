// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyByrXhb3M4D3M8TIm_uXSE6EUE5nJmXvc8",
  authDomain: "inutriscan.firebaseapp.com",
  projectId: "inutriscan",
  storageBucket: "inutriscan.firebasestorage.app",
  messagingSenderId: "604265048430",
  appId: "1:604265048430:web:feed456f2fe5c5de8ab97f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/*
// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
*/