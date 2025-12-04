# Firebase Client/Server Split - Complete Fix

## Problem

Firebase Auth client SDK code was being executed on the server (Cloud Run/SSR), causing:
```
Component auth has not been registered yet
```

This happened because `lib/firebase.ts` imported `firebase/auth` at the module level, which gets bundled and executed during server-side rendering.

## Solution

Split Firebase into separate client and server modules:

### Files Created

1. **`lib/firebase.client.ts`** - Client-only module
   - Contains Firebase Auth (getAuth, GoogleAuthProvider, etc.)
   - Has `"use client"` directive
   - Only imported in client components

2. **`lib/firebase.server.ts`** - Server-only module
   - Contains Firebase App and DataConnect
   - NO Firebase Auth imports
   - Safe for API routes and SSR

3. **`lib/firebase.ts`** - Re-exports (backward compatibility)
   - Re-exports from client/server modules
   - Maintains existing imports

### Files Updated

All client components now import from `firebase.client.ts`:
- ✅ `contexts/UserContext.tsx`
- ✅ `components/Navbar.tsx`
- ✅ `components/LoginButton.tsx`
- ✅ `app/profile/page.tsx`

### Configuration

- ✅ `next.config.ts` - Webpack excludes `firebase.client.ts` from server builds
- ✅ All API routes use their own Firebase initialization (no changes needed)

## How It Works

1. **Client Components**: Import from `@/lib/firebase.client`
   - Firebase Auth code only runs in browser
   - Never bundled in server builds

2. **Server Code**: Import from `@/lib/firebase.server` (if needed)
   - API routes already have their own initialization
   - No Firebase Auth code on server

3. **Next.js Build**: 
   - Server bundle excludes `firebase.client.ts`
   - Client bundle includes `firebase.client.ts`
   - No Firebase Auth code in server bundle

## Verification

After deployment, verify:
1. ✅ No "Component auth has not been registered yet" errors
2. ✅ Firebase Auth works in browser
3. ✅ API routes work correctly
4. ✅ No Firebase Auth code in server bundle

## Migration Notes

- All existing imports from `@/lib/firebase` still work (re-exports)
- Client components should use `@/lib/firebase.client` for clarity
- Server code should use `@/lib/firebase.server` if needed
- API routes can continue using their own Firebase initialization

