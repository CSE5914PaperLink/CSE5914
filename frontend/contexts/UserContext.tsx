"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChangedListener } from "@/lib/firebase.client";
import { createUser, getUserByEmail } from "@/src/dataconnect-generated";

interface UserContextType {
  firebaseUser: FirebaseUser | null;
  dataConnectUserId: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  firebaseUser: null,
  dataConnectUserId: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dataConnectUserId, setDataConnectUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't set up auth listener until component is mounted on client
    if (!mounted) {
      return;
    }

    const unsubscribe = onAuthStateChangedListener(async (user) => {
      setFirebaseUser(user);

      if (user?.email) {
        try {
          // Check if user exists in DataConnect
          const { data } = await getUserByEmail({ email: user.email });
          
          if (data.users.length > 0) {
            // User exists
            setDataConnectUserId(data.users[0].id);
          } else {
            // Create new user in DataConnect
            const { data: newUserData } = await createUser({
              email: user.email,
              name: user.displayName || user.email.split("@")[0],
            });
            setDataConnectUserId(newUserData.user_insert.id);
          }
        } catch (error) {
          console.error("Error syncing user with DataConnect:", error);
        }
      } else {
        setDataConnectUserId(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [mounted]);

  return (
    <UserContext.Provider value={{ firebaseUser, dataConnectUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}