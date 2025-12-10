# Deployment Guide (Web-Based)

This guide explains how to deploy the application using the **Google Cloud Console** and **Firebase Console** directly from your browser. We will use **Cloud Shell**, a built-in terminal that comes pre-installed with all the necessary tools.

## Prerequisites
1.  **Google Cloud Account**: Access to the [Google Cloud Console](https://console.cloud.google.com/).
2.  **Firebase Account**: Access to the [Firebase Console](https://console.firebase.google.com/).
3.  **Project Created**: You should have a project created in Firebase (which automatically creates a Google Cloud project).

---

## Part 1: Setup Cloud Shell

1.  Open the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project from the dropdown at the top.
3.  Click the **Activate Cloud Shell** icon in the top-right toolbar (it looks like a terminal prompt `>_`).
4.  A terminal window will open at the bottom of your screen.

### Get Your Code
You need to get your project files into Cloud Shell.

**Option A: Git (Recommended)**
If your code is on GitHub:
```bash
git clone <your-repository-url>
cd <your-repository-name>
```

**Option B: Upload**
1.  In the Cloud Shell toolbar, click the **Three Dots** menu > **Upload**.
2.  Select your project files/folder from your computer.
3.  Once uploaded, unzip if necessary and `cd` into the directory.

---

## Part 2: Backend Deployment (Cloud Run)

We will deploy the backend container to Cloud Run.

### 1. Configure Project
Run this command in Cloud Shell to ensure you are targeting the correct project:
```bash
gcloud config set project <YOUR_PROJECT_ID>
```
*(You can find your Project ID in the dashboard home page).*

### 2. Deploy
Navigate to the backend folder and run the deployment script:
```bash
cd backend
chmod +x deploy_backend.sh
./deploy_backend.sh
```
- If asked to enable APIs, type `y`.
- If asked to allow unauthenticated invocations, type `y` (for public access).

### 3. Get Backend URL
The script will output a URL (e.g., `https://backend-service-xyz-uc.a.run.app`). **Copy this URL.**

### 4. Set Environment Variables (Via Console UI)
Instead of using the CLI, you can set secrets in the UI:
1.  Go to **Cloud Run** in the Google Cloud Console.
2.  Click on `backend-service`.
3.  Click **Edit & Deploy New Revision** (top center).
4.  Go to the **Variables & Secrets** tab.
5.  Add the following **Environment Variables**:
    - `GEMINI_API_KEY`: Your Gemini API key.
    - `NOMIC_API_KEY`: Your Nomic API key.
    - `GITHUB_API_TOKEN`: Your GitHub token.
6.  **Important**: Since you are using local embeddings, you might need more memory. Go to the **Resources** tab and increase Memory to **2 GiB** or **4 GiB**.
7.  Click **Deploy**.

---

## Part 3: Frontend Deployment (Firebase Hosting)

We will deploy the frontend using Firebase Hosting.

### 1. Navigate to Frontend
In Cloud Shell:
```bash
cd ../frontend
```

### 2. Login to Firebase
```bash
firebase login --no-localhost
```
- It will give you a URL. Click it to login with your Google account.
- Copy the authorization code back into the terminal.

### 3. Configure Backend Connection
Create the production environment file:
```bash
# Create the file
nano .env.production
```
Paste the following (replace with your ACTUAL backend URL from Part 2):
```
NEXT_PUBLIC_BACKEND_HOSTNAME="backend-service-xyz-uc.a.run.app"
```
- Press `Ctrl+O`, `Enter` to save.
- Press `Ctrl+X` to exit.

### 4. Deploy
```bash
firebase deploy --only hosting
```

### 5. Get Frontend URL
Firebase will output your website URL (e.g., `https://your-project.web.app`).

---

## Part 4: Final Connection

1.  Go back to the **Cloud Run** console for `backend-service`.
2.  Click **Edit & Deploy New Revision**.
3.  In **Variables & Secrets**, add/update:
    - `BACKEND_CORS_ORIGINS`: `["https://your-project.web.app"]`
    *(Replace with your actual frontend URL).*
4.  Click **Deploy**.

## Verification
Open your Firebase Hosting URL (`https://your-project.web.app`) in a new tab. Your app should now be live and connected to the backend!
