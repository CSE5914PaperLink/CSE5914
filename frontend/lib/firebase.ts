/**
 * Firebase Module - Re-exports
 * 
 * This file re-exports from client/server modules based on context.
 * For client components, use firebase.client.ts directly.
 * For server code, use firebase.server.ts directly.
 * 
 * This file exists for backward compatibility.
 */

// Re-export client-side functions (will only work in client components)
export {
  signInWithGoogle,
  signOutUser,
  onAuthStateChangedListener,
  getFirebaseAuth,
  getDataConnectInstance,
  dataConnect,
} from "./firebase.client";

// Re-export server-side functions
export {
  getFirebaseApp,
  getDataConnectInstance as getDataConnectInstanceServer,
  dataConnect as dataConnectServer,
} from "./firebase.server";
