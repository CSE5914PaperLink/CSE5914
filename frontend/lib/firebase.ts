import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

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
    initializeApp(firebaseConfig as any);
  }
}

initFirebaseApp();

const auth = getAuth();

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

export { auth };
