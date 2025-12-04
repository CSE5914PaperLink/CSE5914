# Complete List of Files That Could Cause "Component auth has not been registered yet" Error

## 🔴 CRITICAL FILES (Most Likely Sources)

### Core Firebase Modules
1. **`lib/firebase.client.ts`** ⚠️ HIGHEST PRIORITY
   - Contains all Firebase Auth code
   - Must use dynamic imports (currently fixed)
   - Has `"use client"` directive

2. **`lib/firebase.server.ts`**
   - Should NOT import firebase/auth
   - Check for any accidental auth imports

3. **`lib/firebase.ts`**
   - Re-exports from client/server
   - Could cause issues if imported in server context

### Layout & Root Components
4. **`app/layout.tsx`** ⚠️ CRITICAL
   - Server component by default
   - Imports UserProvider (must use dynamic import with ssr: false)
   - Currently fixed with dynamic import

### Context Providers
5. **`contexts/UserContext.tsx`** ⚠️ HIGH PRIORITY
   - Imports `onAuthStateChangedListener` from firebase.client
   - Used in layout.tsx
   - Must have `"use client"` directive (currently has it)
   - Uses `import type` for Firebase User (currently fixed)

## 🟡 HIGH PRIORITY FILES (Client Components Using Firebase Auth)

### Components
6. **`components/Navbar.tsx`**
   - Imports `signOutUser` from firebase.client
   - Used in layout.tsx
   - Must have `"use client"` (currently has it)

7. **`components/LoginButton.tsx`**
   - Imports `signInWithGoogle`, `signOutUser`, `onAuthStateChangedListener`
   - Uses `import type` for User (currently fixed)
   - Must have `"use client"` (currently has it)

### Page Components
8. **`app/profile/page.tsx`**
   - Imports `signOutUser` from firebase.client
   - Uses `useUser` hook
   - Must have `"use client"` (currently has it)

9. **`app/login/page.tsx`**
   - Uses LoginButton component
   - Must have `"use client"` (currently has it)

## 🟢 MEDIUM PRIORITY FILES (Using User Context)

### Pages Using useUser Hook
10. **`app/page.tsx`** (Home page)
    - Uses UserContext via useUser
    - Must have `"use client"` (currently has it)

11. **`app/library/page.tsx`**
    - Uses `useUser` hook
    - Must have `"use client"` (currently has it)

12. **`app/compare/page.tsx`**
    - Uses `useUser` hook
    - Must have `"use client"` (currently has it)

13. **`app/discovery/page.tsx`**
    - Uses `useUser` hook
    - Must have `"use client"` (currently has it)

14. **`app/chat/page.tsx`**
    - Uses `useUser` hook
    - Must have `"use client"` (currently has it)

15. **`app/docs/page.tsx`**
    - Check if it uses UserContext or Firebase

## 🔵 LOW PRIORITY FILES (API Routes - Should NOT Use Auth)

### API Routes (Should NOT import firebase/auth)
16. **`app/api/chat/route.ts`**
    - Should only use firebase/app and firebase/data-connect
    - Check for any firebase/auth imports

17. **`app/api/chat/sessions/route.ts`**
    - Should only use firebase/app and firebase/data-connect

18. **`app/api/chat/sessions/[id]/route.ts`**
    - Should only use firebase/app and firebase/data-connect

19. **`app/api/library/add/route.ts`**
    - Should only use firebase/app and firebase/data-connect

20. **`app/api/library/list/route.ts`**
    - Should only use firebase/app and firebase/data-connect

21. **`app/api/library/favorite/route.ts`**
    - Should only use firebase/app and firebase/data-connect

22. **`app/api/library/delete/route.ts`**
    - Should only use firebase/app and firebase/data-connect

23. **`app/api/library/check-status/route.ts`**
    - Should only use firebase/app and firebase/data-connect

24. **`app/api/discovery/search/route.ts`**
    - Should only use firebase/app and firebase/data-connect

25. **`app/api/discovery/add/route.ts`**
    - Should only use firebase/app and firebase/data-connect

26. **`app/api/discovery/save-search/route.ts`**
    - Should only use firebase/app and firebase/data-connect

27. **`app/api/discovery/search-history/route.ts`**
    - Should only use firebase/app and firebase/data-connect

28. **`app/api/compare/route.ts`**
    - Should only use firebase/app and firebase/data-connect

## ⚙️ CONFIGURATION FILES

29. **`next.config.ts`** ⚠️ IMPORTANT
    - Webpack config to exclude firebase.client from server builds
    - Must exclude firebase/auth from server bundle
    - Currently configured

30. **`package.json`**
    - Check Firebase version compatibility
    - Check for version conflicts
    - Currently using firebase@^11.3.0

## 🔍 CHECKLIST FOR EACH FILE

For each file above, verify:

### For Client Components:
- [ ] Has `"use client"` directive at the top
- [ ] Imports from `@/lib/firebase.client` (not `@/lib/firebase`)
- [ ] Uses `import type` for Firebase types (not regular import)
- [ ] No direct imports from `firebase/auth` (except type imports)

### For Server Components:
- [ ] Does NOT import from `@/lib/firebase.client`
- [ ] Does NOT import from `firebase/auth`
- [ ] Uses dynamic import for any client components that use Firebase

### For API Routes:
- [ ] Only imports `firebase/app` and `firebase/data-connect`
- [ ] Does NOT import `firebase/auth`
- [ ] Does NOT import from `@/lib/firebase.client`

### For Layout:
- [ ] Uses `dynamic()` import for UserProvider with `ssr: false`
- [ ] Does NOT directly import UserProvider

## 🎯 MOST LIKELY CULPRITS (Check These First)

1. **`app/layout.tsx`** - Must use dynamic import for UserProvider
2. **`lib/firebase.client.ts`** - Must use dynamic imports for firebase/auth
3. **`contexts/UserContext.tsx`** - Must have "use client" and use type imports
4. **`next.config.ts`** - Must exclude firebase.client from server builds
5. **Any page without `"use client"`** that imports UserContext or Firebase

## 📝 NOTES

- All page components currently have `"use client"` ✅
- All components currently have `"use client"` ✅
- Layout uses dynamic import ✅
- firebase.client.ts uses dynamic imports ✅
- All type imports are using `import type` ✅

If error persists, check:
1. Build cache - clear `.next` folder
2. Node modules - reinstall dependencies
3. Browser cache - hard refresh
4. Check if any new files were added that import Firebase Auth

