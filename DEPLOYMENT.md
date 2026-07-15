# ☁️ Deployment Guide

Production topology:

```
[Vercel]  ──HTTPS──▶  [Render / Railway]  ──SSL──▶  [Supabase PostgreSQL]
frontend              Express API + Socket.IO        database
```

Deploy in this order: **1) Database → 2) Backend → 3) Frontend**, because each step
produces a URL/credential the next one needs.

---

## 1) Database — Supabase

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. **Project Settings → Database → Connection string → URI**. Copy it, e.g.
   `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`
   - If you use the **connection pooler** URL (port `6543`), append
     `?pgbouncer=true&connection_limit=1`.
3. Tables are created by the backend deploy step below (`prisma db push`) —
   or paste `database/schema.sql` into the Supabase **SQL Editor** and run it
   (that also inserts the default admin).

---

## 2) Backend — Render (or Railway)

### Render
1. Push the repo to GitHub.
2. Render → **New → Web Service** → pick the repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   - **Start Command**: `npm run seed && npm start`
     > After the first successful deploy, change the Start Command to just `npm start`
     > (the seed is idempotent, but there's no need to run it every boot).
4. **Environment variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | your Supabase URI |
   | `JWT_SECRET` | long random string — `openssl rand -hex 32` |
   | `CLIENT_URL` | your Vercel URL, e.g. `https://your-app.vercel.app` *(set after step 3, then redeploy)* |
   | `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | your SMTP provider |

5. Deploy. Verify: `https://your-api.onrender.com/health` → `{"success":true,"status":"ok"}`.

Notes:
- The app already sets `trust proxy`, so rate limiting and login IPs work correctly behind Render's proxy.
- Socket.IO works on Render/Railway out of the box (WebSocket with polling fallback).
- Render free tier sleeps after inactivity; the first request after sleep takes ~30s.

### Railway (alternative)
1. Railway → **New Project → Deploy from GitHub repo**.
2. Set **Root Directory** to `backend` in service settings.
3. Same environment variables as above.
4. **Build**: `npm install && npx prisma generate && npx prisma db push` · **Start**: `npm start`.
5. Run the seed once from a shell: `npm run seed` (or keep it in the start command for the first boot).

---

## 3) Frontend — Vercel

1. Vercel → **Add New → Project** → import the repo.
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - Build command `npm run build`, output `dist` (defaults)
3. **Environment variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your backend URL, e.g. `https://your-api.onrender.com` (no trailing slash) |

4. Add a rewrite so React Router handles deep links (e.g. `/admin`) — create
   `frontend/vercel.json`:

   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
   *(This file is already included in the project.)*

5. Deploy, copy your Vercel URL, then go back to the backend and set
   `CLIENT_URL=https://your-app.vercel.app` and redeploy the backend
   (this authorizes CORS and Socket.IO connections from your domain).

---

## 4) Post-deploy checklist

- [ ] `/health` returns ok over HTTPS
- [ ] Register a real account → welcome email arrives
- [ ] `https://your-app.vercel.app/admin` → login `admin@company.com` / `Admin@12345`
- [ ] **Immediately change the admin password** (Admin → Users won't show admins; log in as admin, use forgot-password with the admin email, or update the seed and re-run)
- [ ] Sign up from a second device → appears live on the admin dashboard
- [ ] Forgot-password OTP email arrives and the reset works
- [ ] CSV downloads work
- [ ] Rate limiting: >20 rapid login attempts returns HTTP 429

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error in browser console | `CLIENT_URL` on the backend must exactly match your Vercel origin (https, no trailing slash). Redeploy backend after changing. |
| `P1001: Can't reach database` | Wrong `DATABASE_URL` / password. If using the pooler (port 6543), add `?pgbouncer=true&connection_limit=1`. |
| Realtime not updating | Socket.IO connects to `VITE_API_URL` with your JWT — confirm you're logged in as ADMIN and `CLIENT_URL` is correct. |
| Emails not sending | Check SMTP creds. Gmail requires an App Password, not your account password. Try leaving `SMTP_HOST` empty and read the backend logs to confirm the rest of the flow. |
| 404 on page refresh at `/admin` | The `vercel.json` rewrite is missing. |
