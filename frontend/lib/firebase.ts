import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getDataConnect } from "firebase/data-connect";

import { connectorConfig } from "@/lib/dataconnect";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initFirebaseApp() {
  // Prevent re-initializing in dev/hot-reload
  if (!getApps().length) {
    return initializeApp(firebaseConfig as any);
  }
  return getApps()[0];
}

const app = initFirebaseApp();

export const dataConnect = getDataConnect(app, connectorConfig);

// Lazy initialization of auth - only on client side
let authInstance: ReturnType<typeof getAuth> | null = null;

function getAuthInstance(): ReturnType<typeof getAuth> {
  if (typeof window === "undefined") {
    throw new Error("Auth can only be used on the client side");
  }
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export async function signInWithGoogle(): Promise<"success" | "error"> {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAuthInstance(), provider);
    return "success";
  } catch (e) {
    console.error("Firebase sign in error", e);
    return "error";
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(getAuthInstance());
  } catch (e) {
    console.error("Firebase sign out error", e);
  }
}

export function onAuthStateChangedListener(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

// Export auth as a getter to maintain compatibility
export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop) {
    return getAuthInstance()[prop as keyof ReturnType<typeof getAuth>];
  },
});
