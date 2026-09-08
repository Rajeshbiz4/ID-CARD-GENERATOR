# School ID Card Generator v1.8 Final

Includes all requested changes:
- Admin login + school login
- Admin creates school registrations
- School profile + branding
- Student CRUD
- Real file upload instead of image URLs
- MongoDB GridFS image storage
- Student photo, school logo, principal signature, custom-template background uploads
- 50 built-in templates with different layouts (not just colors)
- Portrait and landscape layouts
- Custom Template Designer with draggable fields
- System/custom template picker
- PNG and PDF generation
- Square application UI everywhere; ID-card artwork itself can still use circles/curves
- Vercel-ready frontend/backend

## Backend
1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI`
3. Run:

```bash
npm install
npm run seed
npm run dev
```

Default admin: `admin@idcard.local` / `Admin@123`

## Frontend
```bash
npm install
npm run dev
```

## Vercel
Backend root: `backend`
Frontend root: `frontend`

Backend env:
- MONGODB_URI
- JWT_SECRET
- CLIENT_URL

Frontend env:
- VITE_API_URL=https://YOUR-BACKEND.vercel.app/api


## Important: predefined templates now auto-create

From v1.7, the backend automatically checks the template collection when the
API starts. If the 20 SYSTEM templates are missing, they are inserted/upserted.

That means this works on Vercel even if `npm run seed` was not run during
deployment.

Custom school templates are never deleted by this bootstrap.

You can still run:

```bash
npm run seed
```

manually to create the development admin account and explicitly seed the
template library.


## v1.8 template and image fixes

- Rebuilt all 20 predefined templates with safe spacing and layout zones.
- Text uses clipping/ellipsis so long values cannot overlap neighboring fields.
- QR areas are isolated from text.
- Default school logo is bundled with the frontend.
- Default student photo placeholder is bundled with the frontend.
- School logo uploads are normalized to 600x600 transparent PNG with safe padding.
- Student photos are normalized to 600x750 portrait PNG with center crop.
- Principal signatures are normalized to 1000x300 transparent PNG.
- Custom template backgrounds are normalized according to portrait/landscape orientation.
- Login page redesigned as a genuine production-style school SaaS login.
- The global application UI remains square-cornered as requested.
