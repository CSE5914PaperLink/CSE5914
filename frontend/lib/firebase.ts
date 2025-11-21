import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getDataConnect } from "firebase/data-connect";

import { connectorConfig } from "@/lib/dataconnect";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function initFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (!apps.length) {
    return initializeApp(firebaseConfig);
  }
  return apps[0]!; // non-null assertion: we *know* there’s at least one app here
}

const app = initFirebaseApp();

export const auth = getAuth(app);
export const dataConnect = getDataConnect(app, connectorConfig);

export async function signInWithGoogle(): Promise<"success" | "error"> {
  try {
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
    await signOut(auth);
  } catch (e) {
    console.error("Firebase sign out error", e);
  }
}

export function onAuthStateChangedListener(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
