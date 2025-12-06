# Files to Share for Firebase Auth Error Diagnosis

## 🔴 CRITICAL FILES (Must Include)

### 1. Firebase Configuration Files
- **`frontend/lib/firebase.client.ts`** - Client-side Firebase module (MOST IMPORTANT - currently has static imports which is the issue!)
- **`frontend/lib/firebase.server.ts`** - Server-side Firebase module
- **`frontend/lib/firebase.ts`** - Re-exports file

### 2. Layout & Context Files
- **`frontend/app/layout.tsx`** - Root layout (uses ClientLayout)
- **`frontend/components/ClientLayout.tsx`** - Client layout wrapper (uses dynamic imports)
- **`frontend/contexts/UserContext.tsx`** - User context provider

### 3. Configuration Files
- **`frontend/next.config.ts`** - Next.js webpack configuration
- **`frontend/package.json`** - Dependencies and versions (shows Firebase v11.3.0)

## 🟡 HIGH PRIORITY FILES (Should Include)

### 4. Components Using Firebase Auth
- **`frontend/components/Navbar.tsx`** - Uses signOutUser
- **`frontend/components/LoginButton.tsx`** - Uses signInWithGoogle, signOutUser
- **`frontend/app/profile/page.tsx`** - Uses signOutUser

### 5. Build & Deployment Config
- **`frontend/Dockerfile`** - If using Docker deployment
- **`frontend/.dockerignore`** - Docker ignore patterns

## 🟢 HELPFUL CONTEXT FILES (Optional but Useful)

### 6. Error Context
- **`frontend/FILES_TO_CHECK.md`** - List of all files we identified
- **`frontend/FINAL_FIX_DYNAMIC_IMPORTS.md`** - Previous fix attempts
- **`frontend/FIREBASE_CLIENT_SERVER_SPLIT.md`** - Architecture documentation

### 7. Package Lock (For Version Analysis)
- **`frontend/package-lock.json`** - Exact dependency versions (can be large, share relevant sections)

## 📋 Quick Copy List

```
frontend/lib/firebase.client.ts
frontend/lib/firebase.server.ts
frontend/lib/firebase.ts
frontend/app/layout.tsx
frontend/contexts/UserContext.tsx
frontend/next.config.ts
frontend/package.json
frontend/components/Navbar.tsx
frontend/components/LoginButton.tsx
frontend/app/profile/page.tsx
```

## 🎯 Minimal Set (If File Count is Limited)

If you can only share a few files, prioritize these:

1. **`frontend/lib/firebase.client.ts`** - ⚠️ THE CORE ISSUE - Has static imports of firebase/auth
2. **`frontend/app/layout.tsx`** - Root layout structure
3. **`frontend/components/ClientLayout.tsx`** - How UserProvider is dynamically imported
4. **`frontend/next.config.ts`** - Webpack configuration
5. **`frontend/package.json`** - Version information (Firebase v11.3.0)
6. **`frontend/contexts/UserContext.tsx`** - How Firebase is used

## ⚠️ KNOWN ISSUE IN CURRENT CODE

**`frontend/lib/firebase.client.ts`** currently has **static imports** at the top:
```typescript
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  ...
} from "firebase/auth";
```

**This is the problem!** Even with `"use client"`, static imports are evaluated during SSR/SSG.

**Solution**: Use dynamic imports instead:
```typescript
// Instead of static import, use:
const authModule = await import("firebase/auth");
```

## 📝 What to Include in Your Message

When sharing with ChatGPT, include:

1. **Error Message**: Exact error text
2. **When It Happens**: On page load? On specific action?
3. **Environment**: Production (Cloud Run) or local?
4. **Browser Console**: Any additional errors or warnings
5. **Network Tab**: Any failed requests related to Firebase

## 🔍 Key Questions to Answer

1. Does the error happen on initial page load or after user interaction?
2. Is it happening in production only, or also locally?
3. What's the exact stack trace from browser console?
4. Are there any other Firebase-related errors?
5. What Firebase version is installed? (from package.json)

