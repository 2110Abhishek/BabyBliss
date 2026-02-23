import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAvI5-KnvSS7kEhNGrfiNsU8FBDPfCfBs8",
  authDomain: "blissbloomly-de0a8.firebaseapp.com",
  projectId: "blissbloomly-de0a8",
  storageBucket: "blissbloomly-de0a8.firebasestorage.app",
  messagingSenderId: "428326819987",
  appId: "1:428326819987:web:9af3a52c4c9029223b5566",
  measurementId: "G-D95GEV7ZHM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
