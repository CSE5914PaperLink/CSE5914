# Frontend Deployment Steps

Now that your backend is deployed, follow these steps to deploy your frontend.

## Step 1: Get Your Backend URL

First, you need to get your backend URL from the deployment output. It should look like:
```
https://backend-XXXXX-XX.a.run.app
```

**If you don't have it**, you can find it:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **PaperLink** (`paper-477421`)
3. Go to **App Hosting** → **Backend**
4. Copy the URL

**Or check via command line:**
```powershell
firebase apphosting:backends:list
```

---

## Step 2: Generate Data Connect SDK for Frontend

```powershell
cd CSE5914\frontend
firebase dataconnect:sdk:generate
```

This creates the `src/dataconnect-generated/` directory with the TypeScript SDK.

---

## Step 3: Set Up Environment Variables

You need to create environment variables for your frontend. For **Firebase Hosting**, you'll set these during build.

### Option A: Create `.env.production` file (for local build)

Create `frontend/.env.production`:

```env
# Backend URL (replace with your actual backend URL)
BACKEND_URL=https://your-backend-url.run.app

# Backend hostname for Next.js image optimization
BACKEND_HOSTNAME=your-backend-url.run.app

# Firebase Configuration (get from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=paper-477421.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=paper-477421
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=paper-477421.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**To get Firebase config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **PaperLink**
3. Click gear icon → **Project Settings**
4. Scroll to **Your apps** section
5. Copy the config values

### Option B: Set in Vercel/Other Platform

If deploying to Vercel or another platform, set these as environment variables in the platform's dashboard.

---

## Step 4: Update next.config.ts with Backend Hostname

Update `frontend/next.config.ts` to use your backend URL:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.BACKEND_HOSTNAME || "your-backend-url.run.app", // Replace with your backend hostname
        pathname: "/library/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/library/images/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
};

export default nextConfig;
```

**Or** set `BACKEND_HOSTNAME` environment variable instead of hardcoding.

---

## Step 5: Install Dependencies and Build

```powershell
cd CSE5914\frontend

# Install dependencies
npm install

# Generate Data Connect SDK (if not done already)
firebase dataconnect:sdk:generate

# Build for production
npm run build
```

**If build fails:**
- Check that all environment variables are set
- Verify `src/dataconnect-generated/` exists
- Check for TypeScript errors: `npm run lint`

---

## Step 6: Deploy Frontend

### Option A: Firebase Hosting (Recommended for Firebase projects)

```powershell
cd CSE5914\frontend

# Make sure you're using the correct project
firebase use paper-477421

# Deploy
firebase deploy --only hosting
```

**Note**: Firebase Hosting with Next.js requires special configuration. You may want to use Vercel instead (see Option B).

### Option B: Vercel (Recommended for Next.js)

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy:**
   ```powershell
   cd CSE5914\frontend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
   - Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` and `BACKEND_URL` variables

### Option C: Other Platforms

Follow your platform's Next.js deployment guide, ensuring:
- Environment variables are set
- Build command: `npm run build`
- Output directory: `.next` (or as per platform requirements)

---

## Step 7: Update Backend CORS (If Needed)

After you get your frontend URL, update the backend CORS configuration:

1. **Get your frontend URL** (from deployment output)
   - Firebase Hosting: `https://paper-477421.web.app` or `https://paper-477421.firebaseapp.com`
   - Vercel: `https://your-app.vercel.app`

2. **Update `backend/apphosting.yaml`:**
   ```yaml
   - variable: ALLOWED_ORIGINS
     value: "http://localhost:3000,http://127.0.0.1:3000,https://paper-477421.web.app,https://paper-477421.firebaseapp.com,https://your-vercel-url.vercel.app"
   ```

3. **Redeploy backend:**
   ```powershell
   cd CSE5914\backend
   firebase deploy --only apphosting:backend
   ```

---

## Step 8: Verify Deployment

1. **Visit your frontend URL**
2. **Test authentication** (Google Sign-In)
3. **Test adding a paper** to library
4. **Test chat functionality**
5. **Check browser console** for errors

---

## Quick Checklist

- [ ] Backend URL obtained
- [ ] Data Connect SDK generated for frontend
- [ ] Environment variables set (`.env.production` or platform)
- [ ] `next.config.ts` updated with backend hostname
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend built successfully (`npm run build`)
- [ ] Frontend deployed
- [ ] Frontend URL obtained
- [ ] Backend CORS updated with frontend URL
- [ ] Backend redeployed (if CORS was updated)
- [ ] All features tested

---

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify Data Connect SDK is generated
- Run `npm run lint` to check for errors

### Frontend Can't Connect to Backend
- Verify `BACKEND_URL` is set correctly
- Check backend CORS includes frontend URL
- Check backend is running and accessible

### Firebase Auth Not Working
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check Firebase Console → Authentication → Settings
- Verify authorized domains include your frontend URL

### Data Connect Queries Fail
- Verify Data Connect service is deployed
- Regenerate SDK: `firebase dataconnect:sdk:generate`
- Check schema matches between frontend and backend

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure monitoring** (error tracking, analytics)
3. **Set up CI/CD** (automatic deployments)
4. **Document your deployment URLs** for your team

