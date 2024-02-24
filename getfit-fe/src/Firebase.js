// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYfe4XkwfBHFBEqjVtT_GNZSSBLAbyM80",
  authDomain: "getfit-5d057.firebaseapp.com",
  projectId: "getfit-5d057",
  storageBucket: "getfit-5d057.appspot.com",
  messagingSenderId: "388272569343",
  appId: "1:388272569343:web:0112e2e45d66d547d405ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)