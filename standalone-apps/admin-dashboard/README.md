# LUMSIC Admin Command Center (Standalone App)

This is the standalone Administrator Control Panel for LUMSIC. It is completely separated from the public user-facing website and features strict role-based access control (RBAC) powered by Firebase Authentication and Firestore Security Rules.

## Security & Authentication
- **Role Enforcement:** Only users with role `admin` can authenticate and access the dashboard.
- **Super Administrator:** The primary administrative account is `info.lumsic@gmail.com` (with fallback access for `bankush014@gmail.com`).
- **Database Rules:** All database modifications are guarded by `firestore.rules` which strictly prohibit non-admin users from reading or writing administrative records.
- **No API Secrets:** No API keys or backend credentials are exposed in the frontend client.

## How to Deploy on Its Own URL

### Option 1: Deploy on Vercel
1. In your Vercel dashboard, click **Add New Project**.
2. Select your repository and set the **Root Directory** to `standalone-apps/admin-dashboard`.
3. Framework Preset: **Vite**.
4. Click **Deploy**.
5. Add your custom domain (e.g. `https://admin.yourdomain.com`).

### Option 2: Deploy on Netlify
1. Connect your repository to Netlify.
2. Base directory: `standalone-apps/admin-dashboard`.
3. Build command: `npm run build`.
4. Publish directory: `standalone-apps/admin-dashboard/dist`.
5. Assign a custom sub-domain like `admin.yourdomain.com`.

### Option 3: Deploy on Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Choose target directory: dist
npm run build
firebase deploy --only hosting:admin
```
