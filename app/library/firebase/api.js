// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmJLN6jyXG2LMZyxtYVvcAOJ6vKPf3C6w",
  authDomain: "login--expenselite.firebaseapp.com",
  projectId: "login--expenselite",
  storageBucket: "login--expenselite.appspot.com",
  messagingSenderId: "707402579142",
  appId: "1:707402579142:web:8e5b694c7903b69fe26bc7",
  measurementId: "G-RKQZM2JG55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {app,db}