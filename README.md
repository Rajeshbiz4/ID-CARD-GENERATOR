# School ID Card Generator v2.0

React + Vite frontend, Node.js + Express backend and MongoDB Atlas / Mongoose.

## Consolidated v2.0 changes

This release keeps the existing application features and adds/fixes:

- 50 predefined SYSTEM ID-card templates.
- Portrait and landscape layouts.
- Formal, modern, creative, photo, minimal, color-block and Marathi template categories.
- Marathi / Devanagari text support for school, student and custom-template data.
- Marathi text is stored exactly as entered in MongoDB.
- Devanagari-compatible rendering font stack.
- Long student and school names automatically shrink/wrap inside their reserved areas.
- Yellow Marathi school-ID templates modeled on the supplied reference card.
- Yellow templates include:
  - school logo
  - school name
  - UDISE / Registration No.
  - ओळखपत्र
  - student photo
  - student-name band
  - जन्मतारीख
  - रजिस्टर नंबर
  - मोबाईल नंबर
  - principal signature
  - principal name / मुख्याध्यापक
  - academic year
- Principal signature upload remains in School Profile.
- Default school logo and sample student profile are used on the Templates preview when actual images are missing.
- Actual card generation uses uploaded images when available and neutral placeholders when missing.
- Logo upload normalization is preserved.
- Student-photo normalization is preserved.
- Signature normalization is preserved.
- Custom-template background normalization is preserved.
- Custom Template Designer remains available.
- Custom Template Designer supports UDISE, principal name, principal signature and Marathi custom text.
- MongoDB GridFS image storage remains.
- Global loader is mounted once and driven by Axios calls.
- Page-navigation loader is included so loading feedback is visible even for very fast page calls.
- GridFS image loads use local image spinners rather than flashing the whole page.
- Only Student Name is mandatory when creating/editing a student.
- Admission No., class, division, roll no., DOB, blood group, parent/mobile, address and photo are optional.
- Existing MongoDB admission-number unique index is migrated to a partial unique index so blank admission numbers are allowed.
- CORS is currently enabled for all origins as requested.
- Application management UI remains square-cornered.
- Vercel-compatible frontend/backend configuration remains.

## Run locally

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The backend automatically:
1. connects to MongoDB,
2. upserts all 50 SYSTEM templates,
3. preserves CUSTOM templates,
4. migrates the optional Admission No. index,
5. starts the API.

## Vercel

Deploy `backend` and `frontend` as separate Vercel projects.

Frontend environment variable:

```text
VITE_API_URL=https://YOUR-BACKEND.vercel.app/api
```

Recommended backend variables:

```text
MONGODB_URI=<MongoDB Atlas URI>
JWT_SECRET=<strong secret>
CLIENT_URL=<frontend URL>
```

CORS is intentionally open in this release because it was explicitly requested.
For a public production release, restrict it to trusted frontend origins.

## Images

Images are stored in MongoDB GridFS:
- school logo
- principal signature
- student profile photo
- custom-template background

Client-side normalization:
- logo: 600 x 600 PNG, contain + safe padding
- student photo: 600 x 750 PNG, center crop
- signature: 1000 x 300 PNG, contain
- template backgrounds: normalized according to orientation


## v2.1 Marathi phonetic typing

Data fields already store Unicode Marathi exactly as entered. v2.1 additionally
adds an in-app typing mode:

- English
- मराठी Phonetic

When Marathi Phonetic mode is active, users can type Marathi words using
English/Roman letters and choose Marathi transliteration suggestions.

Enabled on:
- Add/Edit Student
- School Profile
- Admin Register School
- Custom Template Designer

Examples of supported text areas include student name, parent name, class,
division, address, school name, principal name, city/state, custom template
name, prefix and custom text.

The transliteration suggestions are provided by the
`@ai4bharat/indic-transliterate` frontend package with Marathi language code
`mr`. Native Marathi keyboard input continues to work normally as Unicode text.


## Signature standardization

Every predefined SYSTEM ID-card template now contains:
- School logo
- Student photo
- Principal signature section

If a school has uploaded a signature in School Profile, that image is used.
If no signature has been uploaded, a neutral Principal Signature placeholder is
displayed so the signature position remains visible.

New custom templates start with logo, student photo and principal signature
elements. Older custom templates that do not contain a signature receive a
non-persistent render-time fallback signature section so previews and generated
cards still show the area.


## v2.2 npm / React dependency fix

The previous Marathi typing integration used:

```text
@ai4bharat/indic-transliterate@1.3.8
```

That package declares an old React 16 peer dependency and causes npm `ERESOLVE`
when this project installs React 18.

v2.2 replaces it with:

```text
@sarthak1407/react-transliterate
```

and updates `MarathiTyping.jsx` to use `ReactTransliterate`.

Do not use `--force` or `--legacy-peer-deps` for this issue after applying the
v2.2 files. Perform a clean frontend install instead:

Windows PowerShell:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache verify
npm install
npm run dev
```

Windows CMD:

```cmd
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm cache verify
npm install
npm run dev
```

The Marathi Phonetic mode and existing Unicode Marathi storage remain available.
