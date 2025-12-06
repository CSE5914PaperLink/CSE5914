import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

const auth = getAuth(app);
export const dataConnect = getDataConnect(app, connectorConfig);

export async function signInWithGoogle(): Promise<"success" | "error"> {
  try {
    const provider = new GoogleAuthProvider();
    // Try popup first (better UX), fall back to redirect if it fails
    try {
      await signInWithPopup(auth, provider);
      return "success";
    } catch (popupError: any) {
      // If popup is blocked or fails due to COOP, use redirect
      if (
        popupError?.code === "auth/popup-blocked" ||
        popupError?.code === "auth/popup-closed-by-user" ||
        popupError?.message?.includes("Cross-Origin-Opener-Policy")
      ) {
        console.log("Popup blocked, falling back to redirect");
        await signInWithRedirect(auth, provider);
        // Note: signInWithRedirect redirects the page, so we won't return here
        return "success";
      }
      throw popupError;
    }
  } catch (e) {
    console.error("Firebase sign in error", e);
    return "error";
  }
}

export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
    return null;
  } catch (e) {
    console.error("Firebase redirect result error", e);
    return null;
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
