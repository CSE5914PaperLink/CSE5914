/**
 * Firebase Client-Side Module
 * 
 * This module is for CLIENT-SIDE use only.
 */

"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDataConnect, DataConnect } from "firebase/data-connect";
import { connectorConfig } from "@/lib/dataconnect";

// Import auth statically at the top level (only in client components)
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type Auth,
  type User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
let app: FirebaseApp | null = null;
function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized on the client side");
  }
  
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig as any);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

// Get Auth instance
let authInstance: Auth | null = null;
function getAuthInstance(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used on the client side");
  }

  if (!authInstance) {
    const firebaseApp = getFirebaseApp();
    authInstance = getAuth(firebaseApp);
  }
  
  return authInstance;
}

// Initialize DataConnect
let dataConnectInstance: DataConnect | null = null;
export function getDataConnectInstance(): DataConnect {
  if (!dataConnectInstance) {
    const firebaseApp = getFirebaseApp();
    dataConnectInstance = getDataConnect(firebaseApp, connectorConfig);
  }
  return dataConnectInstance;
}

export const dataConnect = new Proxy({} as DataConnect, {
  get(_target, prop) {
    return getDataConnectInstance()[prop as keyof DataConnect];
  },
});

// Auth methods
export async function signInWithGoogle(): Promise<"success" | "error"> {
  try {
    if (typeof window === "undefined") {
      throw new Error("signInWithGoogle can only be called on the client side");
    }
    
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    
    return "success";
  } catch (e) {
    console.error("Firebase sign in error", e);
    return "error";
  }
}

export async function signOutUser(): Promise<void> {
  try {
    if (typeof window === "undefined") {
      return;
    }
    
    const auth = getAuthInstance();
    await signOut(auth);
  } catch (e) {
    console.error("Firebase sign out error", e);
  }
}

export function onAuthStateChangedListener(
  callback: (user: User | null) => void
) {
  if (typeof window === "undefined") {
    return () => {};
  }
  
  try {
    const auth = getAuthInstance();
    return onAuthStateChanged(auth, callback);
  } catch (e) {
    console.error("Error setting up auth state listener:", e);
    return () => {};
  }
}

export function getFirebaseAuth(): Auth {
  return getAuthInstance();
}

export type { User };