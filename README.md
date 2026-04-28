# India Accelerator — Investor Portal (React)

## Quick Start

### 1. Fill in your .env file
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_SUPABASE_SERVICE_KEY=your-service-role-key
REACT_APP_ADMIN_PASSWORD=YourStrongPassword123
```

### 2. Run the db/schema.sql in Supabase SQL Editor

### 3. Start the app
```bash
npm install
npm start
```

- Investor portal → http://localhost:3000
- Admin panel     → http://localhost:3000/admin

### 4. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add your 4 env vars in Vercel dashboard → Project Settings → Environment Variables.

Add this to public/_redirects for Netlify (or vercel.json for Vercel):
```
/* /index.html 200
```
