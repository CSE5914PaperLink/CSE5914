/**
 * Firebase Server-Side Module
 * 
 * This module is for server-side use only (API routes, SSR).
 * It does NOT include Firebase Auth, which is client-only.
 * 
 * DO NOT import firebase/auth in this file.
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDataConnect, DataConnect } from "firebase/data-connect";

import { connectorConfig } from "@/lib/dataconnect";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization for Firebase App (server-side)
let app: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig as any);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

// Lazy initialization for DataConnect (server-side)
let dataConnectInstance: DataConnect | null = null;
export function getDataConnectInstance(): DataConnect {
  if (!dataConnectInstance) {
    const firebaseApp = getFirebaseApp();
    dataConnectInstance = getDataConnect(firebaseApp, connectorConfig);
  }
  return dataConnectInstance;
}

// For backward compatibility, export dataConnect as a getter
export const dataConnect = new Proxy({} as DataConnect, {
  get(_target, prop) {
    return getDataConnectInstance()[prop as keyof DataConnect];
  },
});

