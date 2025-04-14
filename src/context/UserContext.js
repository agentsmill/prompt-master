import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children, initialValue }) {
  const [currentUser, setCurrentUser] = useState(initialValue?.user || null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialValue?.user) {
      setCurrentUser(initialValue?.user);
    }
  }, [initialValue?.user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Get user profile from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // Create user profile if it doesn't exist
            const newUserProfile = {
              displayName: user.displayName || "",
              email: user.email,
              photoURL: user.photoURL || "",
              createdAt: new Date(),
              lastLogin: new Date(),
              preferences: {
                theme: "light",
                language: "pl",
                notifications: true,
              },
            };

            await setDoc(userDocRef, newUserProfile);
            setUserProfile(newUserProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userDocRef,
        { ...userProfile, ...profileData, lastUpdated: new Date() },
        { merge: true }
      );
      setUserProfile((prev) => ({ ...prev, ...profileData }));
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    updateUserProfile,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
