# 🔐 Auth App — Production-Ready Authentication System

Full-stack authentication application with JWT sessions, OTP password reset over email,
a support ticket system, and a **hidden realtime admin panel**.

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite + Tailwind CSS (glassmorphism, dark/light mode) |
| Backend  | Node.js + Express.js |
| Database | PostgreSQL (Supabase) via **Prisma ORM** |
| Auth     | JWT (Bearer tokens) + bcrypt (12 rounds) |
| Email    | Nodemailer (SMTP, with console fallback in dev) |
| Realtime | Socket.IO (JWT-authenticated, admin-only broadcast room) |

---

## ✨ Features

**Public**
- Home page with Login / Create Account / Support
- Register: first name, last name, email, phone, password + confirm — strong-password
  live checklist, unique email, phone validation, bcrypt hashing, **welcome email**
- Login: email + password, **Remember Me (30 days)**, show-password toggle, proper error messages
- Forgot password: email → **6-digit OTP by email** (10-min expiry, max 5 attempts) → new password
- Support page: name, email, subject, message → stored in DB, streams live to admins

**Hidden Admin Panel** (`/admin` — no links anywhere in the UI)
- Admin login (role-checked server-side on every request)
- Live stats: Total Users, Today's Registrations, Active Users (15 min), Total & Open Tickets
- Latest registered users + recent logins feed
- Search users · Delete · Disable / Enable · Reset password
- Download **Users CSV** and **Support Tickets CSV**
- **Realtime**: new signups, logins and tickets appear instantly (Socket.IO)

**Security**
Helmet · CORS allow-list · rate limiting (global + strict auth + OTP) · express-validator ·
input sanitization · Prisma parameterized queries (SQL-injection safe) · bcrypt · JWT purpose
claims · anti user-enumeration responses · disabled-account blocking · body size limits ·
HTTPS-ready (`trust proxy`).

---

## 🚀 Quick Start (Local)

### 0. Prerequisites
- Node.js **18+**
- A free [Supabase](https://supabase.com) account (or any PostgreSQL database)

### 1. Create the database (Supabase)
1. Create a new Supabase project.
2. Go to **Project Settings → Database → Connection string → URI** and copy it.
   It looks like:
   `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`

> Alternative: run PostgreSQL locally and use `postgresql://postgres:postgres@localhost:5432/authapp`

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env:
#   DATABASE_URL = your Supabase connection string
#   JWT_SECRET   = any long random string (32+ chars)
#   SMTP_*       = optional — leave SMTP_HOST empty to print emails to the console

npm install
npx prisma generate        # generate the Prisma client
npx prisma db push         # create all tables in your database
npm run seed               # create the default admin account
npm run dev                # API on http://localhost:5000
```

You should see:
```
🚀 Auth App API running on http://localhost:5000
   Realtime    : Socket.IO ready
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000 (default is fine)
npm install
npm run dev                # App on http://localhost:5173
```

### 4. Log in as admin
Open **http://localhost:5173/admin** (hidden route — type it manually):

| Email | Password |
|-------|----------|
| `admin@company.com` | `Admin@12345` |

> ⚠️ **Change this password immediately in production** (or edit `prisma/seed.js` before seeding).

---

## 📧 Email setup (Nodemailer)

| Mode | How |
|------|-----|
| **Dev (no SMTP)** | Leave `SMTP_HOST` empty — welcome emails and OTP codes are printed to the backend console. The whole flow still works. |
| **Gmail** | `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=` an **App Password** (Google Account → Security → 2-Step Verification → App passwords). |
| **Any SMTP** | Fill the `SMTP_*` variables from your provider (Mailgun, Resend, Brevo, SES…). |

---

## 🗄️ Database

Tables are created automatically by `npx prisma db push` from `backend/prisma/schema.prisma`.
A mirror SQL script is provided at [`database/schema.sql`](database/schema.sql) if you prefer
pasting into the Supabase SQL editor.

| Table | Purpose | Relationships |
|-------|---------|--------------|
| `users` | Accounts. **Admins live here with `role = 'ADMIN'`** — single hardened auth path instead of a duplicate table. The default admin is created by the seed. | — |
| `otps` | Bcrypt-hashed 6-digit reset codes, expiry + attempt counter | `user_id → users` (CASCADE) |
| `login_history` | IP, user-agent, timestamp of every login | `user_id → users` (CASCADE) |
| `support_tickets` | Every support message; linked to the account when the sender is logged in | `user_id → users` (SET NULL) |

---

## 🔌 API Overview

Base URL: `http://localhost:5000`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/health` | — | Health check |
| POST | `/api/auth/register` | — | Create account, sends welcome email, returns JWT |
| POST | `/api/auth/login` | — | Login (`rememberMe` extends token to 30d), records login history |
| GET  | `/api/auth/me` | Bearer | Current user |
| POST | `/api/auth/logout` | Bearer | Logout hook |
| POST | `/api/auth/forgot-password` | — | Sends 6-digit OTP email |
| POST | `/api/auth/verify-otp` | — | Verifies OTP → returns short-lived `resetToken` |
| POST | `/api/auth/reset-password` | — | Sets new password with `resetToken` |
| POST | `/api/support` | optional | Create support ticket |
| GET  | `/api/admin/stats` | Admin | Dashboard stats + latest users + recent logins |
| GET  | `/api/admin/users?search=&page=&limit=` | Admin | List / search users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| PATCH | `/api/admin/users/:id/status` | Admin | `{ "status": "ACTIVE" \| "DISABLED" }` |
| POST | `/api/admin/users/:id/reset-password` | Admin | `{ "newPassword": "..." }` |
| GET  | `/api/admin/tickets` | Admin | All support tickets |
| PATCH | `/api/admin/tickets/:id/status` | Admin | `{ "status": "OPEN" \| "CLOSED" }` |
| GET  | `/api/admin/logins` | Admin | Recent login history |
| GET  | `/api/admin/export/users` | Admin | Users CSV download |
| GET  | `/api/admin/export/tickets` | Admin | Tickets CSV download |

A ready-made **Postman collection** with every request and auto-token scripts is at
[`postman/AuthApp.postman_collection.json`](postman/AuthApp.postman_collection.json).

**Realtime events** (Socket.IO, admin room): `user:registered`, `user:updated`,
`user:deleted`, `ticket:created`, `ticket:updated`, `login:recorded`.

---

## 🧭 Project Structure

```
auth-app/
├── backend/
│   ├── prisma/            schema.prisma, seed.js (default admin)
│   └── src/
│       ├── config/        env, prisma client, nodemailer
│       ├── middleware/    auth (JWT), admin, rate limiters, validation, errors
│       ├── validators/    express-validator chains
│       ├── controllers/   auth, support, admin
│       ├── routes/        /api/auth, /api/support, /api/admin
│       ├── utils/         tokens, sanitize, csv, email templates
│       ├── socket.js      Socket.IO realtime layer
│       ├── app.js         Express app (helmet, cors, limits)
│       └── server.js      HTTP server + graceful shutdown
├── frontend/
│   └── src/
│       ├── lib/           axios instance, socket client
│       ├── context/       AuthContext, ThemeContext (dark/light)
│       ├── components/    Navbar, inputs, cards, route guards…
│       ├── pages/         Home, Register, Login, ForgotPassword, Support, Dashboard
│       └── pages/admin/   AdminLogin, AdminDashboard, tables
├── database/schema.sql    reference SQL (mirror of Prisma schema)
├── postman/               Postman collection
├── README.md              this file
└── DEPLOYMENT.md          Vercel + Render/Railway + Supabase guide
```

---

## ☁️ Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full step-by-step guide:
frontend on **Vercel**, backend on **Render or Railway**, database on **Supabase**.

---

## 🧪 Test the full flow in 2 minutes

1. Register a user at `/register` → check the backend console (or inbox) for the welcome email.
2. Open `/admin` in a second browser/incognito, log in as admin → watch the **Total Users** count.
3. Register another user in the first window → the admin dashboard updates **instantly** with a toast.
4. Log out, click **Forgot password**, enter the email → grab the OTP from the console/inbox → set a new password → log in with it.
5. Send a support ticket from `/support` → it appears live in the admin **Tickets** tab.
6. In the admin panel: search, disable (then try logging in as that user — blocked), enable, reset password, delete, and download both CSVs.
