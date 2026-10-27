# LUMSIC Astrologer Astroboard Workstation (Standalone App)

This is the standalone Astrologer & Psychic Reader Workstation for LUMSIC. It is completely decoupled from the public customer-facing website and features strict role-based access control (RBAC) powered by Firebase Authentication and Firestore Security Rules.

## Security & Authentication
- **Role Enforcement:** Only users registered with the `astrologer` role can authenticate and open this portal.
- **Consultation Workstation:** Astrologers can manage live chats, switch their online availability, view customer birth charts and details, and track their consultation earnings.
- **Database Rules:** Enforced by Firestore Security Rules. Astrologers cannot alter admin configurations or customer balances.
- **Zero Secrets in Code:** No backend API keys or secrets are stored in the frontend codebase.

## How to Deploy on Its Own URL

### Option 1: Deploy on Vercel
1. In your Vercel dashboard, click **Add New Project**.
2. Select your repository and set the **Root Directory** to `standalone-apps/astrologer-dashboard`.
3. Framework Preset: **Vite**.
4. Click **Deploy**.
5. Add your custom domain (e.g. `https://astrologer.yourdomain.com` or `https://astroboard.yourdomain.com`).

### Option 2: Deploy on Netlify
1. Connect your repository to Netlify.
2. Base directory: `standalone-apps/astrologer-dashboard`.
3. Build command: `npm run build`.
4. Publish directory: `standalone-apps/astrologer-dashboard/dist`.
5. Assign a custom sub-domain like `astrologer.yourdomain.com`.

### Option 3: Deploy on Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Choose target directory: dist
npm run build
firebase deploy --only hosting:astrologer
```
