import React, { useContext, createContext, useEffect, useState } from "react";
import axios from 'axios';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Display Name
    if (name) {
      await updateProfile(user, { displayName: name });
    }

    // Send Verification Email
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    return userCredential;
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setWishlist([]);
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      alert("Please login to use wishlist");
      return;
    }

    try {
      const res = await axios.post('https://blissbloomlybackend.onrender.com/api/users/wishlist/toggle', {
        uid: user.uid,
        productId: product._id
      });

      if (res.data.success) {
        // Optimistic update or fetch again
        const listRes = await axios.get(`https://blissbloomlybackend.onrender.com/api/users/wishlist/${user.uid}`);
        setWishlist(listRes.data);
        return res.data.action; // 'added' or 'removed'
      }
    } catch (e) {
      console.error("Wishlist Toggle Error", e);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item && item._id === productId);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Sync User to Mongo
          await axios.post('https://blissbloomlybackend.onrender.com/api/users/sync', {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          });

          const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/users/wishlist/${currentUser.uid}`);
          setWishlist(res.data || []);
        } catch (error) {
          console.error("Error syncing/fetching wishlist:", error);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      wishlist,
      toggleWishlist,
      isInWishlist,
      loginWithGoogle: googleSignIn,
      loginWithEmail,
      signupWithEmail,
      logout,
      resetPassword,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
