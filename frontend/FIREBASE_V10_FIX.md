# Firebase v10+ "Component auth has not been registered yet" Fix

## Problem

In Firebase v10.14.1, the error "Component auth has not been registered yet" occurs when:
1. `GoogleAuthProvider` is instantiated before the auth component is registered
2. The auth module is imported but `getAuth()` hasn't been called yet
3. There's a timing issue where providers try to access auth components before initialization

## Root Cause

Firebase v10+ uses a modular architecture where components must be explicitly registered. The auth component is registered when `getAuth()` is first called. If a provider (like `GoogleAuthProvider`) is created before this registration happens, you get the error.

## Solution Applied

The fix ensures proper initialization order:

1. **Synchronous Auth Initialization**: Auth is initialized synchronously when first accessed (not deferred)
2. **Initialization Order**: In `signInWithGoogle()`:
   - Firebase App is initialized first
   - Auth instance is created (registers the component)
   - Only then is `GoogleAuthProvider` created
3. **Client-Only Checks**: All auth operations verify they're running on the client

## Code Pattern

```typescript
// ✅ CORRECT: Initialize auth before creating provider
const authInstance = getAuthInstance(); // Registers auth component
const provider = new GoogleAuthProvider(); // Now safe to create

// ❌ WRONG: Creating provider before auth is initialized
const provider = new GoogleAuthProvider(); // Error: component not registered
const authInstance = getAuthInstance();
```

## Version Information

- `firebase`: `^10.14.1`
- `@firebase/data-connect`: `^0.3.12`

## If Issue Persists

1. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check for version conflicts**:
   ```bash
   npm list firebase @firebase/data-connect
   ```

3. **Ensure all Firebase packages are compatible** - they should all be from the same major version

4. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   ```

## Additional Notes

- The auth component registration happens when `getAuth()` is called for the first time
- This must happen synchronously, not in a deferred callback
- All client components using Firebase auth must have `"use client"` directive
- Server-side code should never import or use Firebase Auth

