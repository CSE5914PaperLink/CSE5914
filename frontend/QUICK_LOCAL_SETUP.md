# Quick Local Setup - Connect to Hosted Backend

## 3-Step Setup

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the `frontend/` directory with this content:

```env
# Backend API URL (your hosted backend)
BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app
NEXT_PUBLIC_BACKEND_URL=https://backend-api-wirfpvv3kq-uc.a.run.app

# Firebase Configuration (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important**: Replace the Firebase values with your actual Firebase configuration from Firebase Console.

### Step 2: Update Backend CORS (One-time)

Allow your local frontend to connect to the hosted backend:

**Windows (PowerShell):**
```powershell
gcloud run services update backend-api --region us-central1 --set-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

**Mac/Linux:**
```bash
./update-backend-cors.sh
```

Or manually:
```bash
gcloud run services update backend-api \
    --region us-central1 \
    --set-env-vars CORS_ORIGINS="https://backend-api-wirfpvv3kq-uc.a.run.app,http://localhost:3000,http://127.0.0.1:3000"
```

### Step 3: Run the Frontend

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser! 🎉

## Using Setup Scripts (Optional)

### Windows:
```powershell
.\setup-local.ps1
```

### Mac/Linux:
```bash
chmod +x setup-local.sh
./setup-local.sh
```

Then edit `.env.local` with your Firebase config.

## Verify It's Working

1. **Test backend directly:**
   ```bash
   curl https://backend-api-wirfpvv3kq-uc.a.run.app/health
   ```
   Should return: `{"status":"ok"}`

2. **Test frontend API route:**
   ```bash
   curl http://localhost:3000/api/discovery/search?q=test
   ```
   Should return search results

3. **Open browser:**
   - Go to `http://localhost:3000`
   - Check browser console (F12) for any errors
   - Try using the app!

## Troubleshooting

### CORS Errors
- Make sure you ran Step 2 (update backend CORS)
- Check that `localhost:3000` is in the CORS_ORIGINS list

### Connection Errors
- Verify backend URL is correct: `https://backend-api-wirfpvv3kq-uc.a.run.app`
- Test backend health: `curl https://backend-api-wirfpvv3kq-uc.a.run.app/health`

### Environment Variables Not Working
- Restart the dev server after changing `.env.local`
- Make sure file is named exactly `.env.local` (not `.env.local.txt`)
- Check file is in `frontend/` directory (same level as `package.json`)

## What's Configured?

- ✅ **Backend URL**: Points to your hosted backend
- ✅ **CORS**: Backend allows requests from localhost:3000
- ✅ **Environment Variables**: Both server-side and client-side URLs set

## Next Steps

1. ✅ Create `.env.local` with backend URL
2. ✅ Update backend CORS
3. ✅ Run `npm install` (if first time)
4. ✅ Run `npm run dev`
5. ✅ Start developing!

For detailed instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)


