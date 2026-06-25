import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

export let auth;
export let googleProvider;

export const initFirebase = async () => {
  try {
    let API_URL = process.env.REACT_APP_API_URL || 'https://blissbloomlybackend.onrender.com/api';
    API_URL = API_URL.trim();
    if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

    console.log("Fetching config from:", `${API_URL}/config`);
    const response = await fetch(`${API_URL}/config`);
    if (!response.ok) throw new Error("Failed to fetch config");
    const { firebase: firebaseConfig } = await response.json();
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Failed to initialize Firebase", error);
  }
};
