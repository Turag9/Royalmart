# Royalmart Free Deployment

Current free setup, created on May 14, 2026:

- Frontend: Vercel Hobby
- Backend: Vercel Hobby serverless function
- Database: Neon Free Postgres

Live URLs:

- Frontend: `https://royalmart-frontend.vercel.app`
- Backend API: `https://royalmart-backend.vercel.app/api`
- Backend health: `https://royalmart-backend.vercel.app/api/health`

Notes:

- Vercel Hobby is intended for personal/non-commercial projects.
- Keep real secrets out of Git. Use dashboard environment variables.

## 1. Create The Database

1. Create a Neon Postgres project.
2. Copy the pooled or direct PostgreSQL connection string.
3. Use it as `DATABASE_URL` in the backend host.

## 2. Deploy Backend On Vercel

The backend is deployed as a Vercel Node serverless project from:

- Root Directory: `Royalmart-Backend`
- API entry: `api/index.js`
- Vercel config: `Royalmart-Backend/vercel.json`

Environment variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=generate-a-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

After deployment, check:

```text
https://your-backend.vercel.app/api/health
```

It should return:

```json
{ "status": "ok" }
```

## 3. Deploy Frontend On Vercel

Create a Vercel project from the same Git repository and set:

- Root Directory: `Royalmart-Forntend/ royal mart react`
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

## 4. Update CORS

After Vercel gives the final frontend URL, redeploy the backend with `CORS_ORIGIN` set to that exact URL.

## 5. Optional Seed

If you want sample data in the live database, run the backend seed once with the live `DATABASE_URL`:

```bash
npm run db:seed
```
