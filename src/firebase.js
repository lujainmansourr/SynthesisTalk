// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5eLNjXSa48A6EvnmkmjX-81yINs5kaoM",
  authDomain: "synthesistalk-project.firebaseapp.com",
  projectId: "synthesistalk-project",
  storageBucket: "synthesistalk-project.firebasestorage.app",
  messagingSenderId: "391623469071",
  appId: "1:391623469071:web:b076964d605dd1ee829b7a",
  measurementId: "G-HGZT02HM1L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

