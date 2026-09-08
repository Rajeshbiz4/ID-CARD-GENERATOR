# Vercel Deployment Update

Copy the files from this update pack into the matching paths in your existing project.

## Files

### Frontend

Copy:

```text
frontend/vercel.json
```

This fixes React Router deep-link/refresh behavior on Vercel.

`frontend/.env.production.example` is only a reference. Do not commit a real production URL unless you want to.

### Backend

Replace:

```text
backend/src/server.js
backend/src/seed.js
```

Add:

```text
backend/src/config/database.js
```

`backend/.env.vercel.example` is a reference for Vercel settings.

---

# 1. Backend Vercel project

Import your Git repository into Vercel.

Set:

```text
Root Directory: backend
```

The project contains `src/server.js`, which exports the Express app for Vercel.

Add these Environment Variables:

```text
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
CLIENT_URL=https://<your-frontend-project>.vercel.app
ALLOW_VERCEL_PREVIEWS=false
```

Deploy.

After deployment, test:

```text
https://<backend>.vercel.app/api/health
```

You should receive a successful JSON response.

---

# 2. Seed MongoDB

Do this from your local backend once:

```bash
npm install
npm run seed
```

The seed uses the same `MONGODB_URI`.

Default development admin:

```text
admin@idcard.local
Admin@123
```

Change this for production.

---

# 3. Frontend Vercel project

Create a second Vercel project from the same repository.

Set:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Add:

```text
VITE_API_URL=https://<backend-project>.vercel.app/api
```

Deploy/redeploy.

---

# 4. MongoDB Atlas Network Access

Vercel serverless functions normally do not have one fixed outbound IP on standard setups.

Your Atlas network configuration must allow the Vercel backend to connect.

For a simple first deployment, many developers temporarily allow:

```text
0.0.0.0/0
```

If you do this:
- use a strong unique MongoDB user password
- give the database user only the permissions it needs
- do not expose the URI in Git
- move to stricter networking when appropriate

---

# 5. Important security note

Do not hard-code this in `database.js`:

```text
mongodb+srv://username:password@...
```

The JavaScript file contains the database connection mechanism and database name.
The actual credential belongs in Vercel Environment Variables.

If a MongoDB password was previously committed or shared, rotate that password before production deployment.
