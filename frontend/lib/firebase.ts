import { initializeApp, getApps } from "firebase/app";
import type { User } from "firebase/auth";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initFirebaseAppClientSide() {
  // Only initialize Firebase in the browser to avoid running during SSR/prerender
  if (typeof window === "undefined") return;
  if (!getApps().length) {
    initializeApp(firebaseConfig as any);
  }
}

function getClientAuth() {
  initFirebaseAppClientSide();
  return getAuth();
}

export async function signInWithGoogle(): Promise<"success" | "error"> {
  try {
    if (typeof window === "undefined") {
      console.warn("signInWithGoogle called on server — ignoring");
      return "error";
    }
    const provider = new GoogleAuthProvider();
    const auth = getClientAuth();
    await signInWithPopup(auth, provider);
    return "success";
  } catch (e) {
    console.error("Firebase sign in error", e);
    return "error";
  }
}

export async function signOutUser(): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    const auth = getClientAuth();
    await signOut(auth);
  } catch (e) {
    console.error("Firebase sign out error", e);
  }
}

export function onAuthStateChangedListener(
  callback: (user: User | null) => void
) {
  if (typeof window === "undefined") {
    // During SSR there's no auth — return a noop unsubscribe
    return () => {};
  }
  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

// Note: we intentionally do not export a global `auth` instance because
// initializing it during module evaluation can cause errors during SSR/prerender
