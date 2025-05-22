// firebaseConfig.ts
// @aandreu7

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

import Constants from 'expo-constants';

const GOOGLE_API_KEY = Constants.expoConfig.extra?.GOOGLE_API_KEY ?? Constants.manifest?.extra?.GOOGLE_API_KEY;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
  authDomain: "inutriscan.firebaseapp.com",
  projectId: "inutriscan",
  storageBucket: "inutriscan.firebasestorage.app",
  messagingSenderId: "604265048430",
  appId: "1:604265048430:web:feed456f2fe5c5de8ab97f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);