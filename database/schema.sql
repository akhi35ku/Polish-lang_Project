-- ============================================================
-- Auth App — PostgreSQL schema (mirror of prisma/schema.prisma)
-- You normally DON'T run this by hand: `npx prisma db push`
-- creates everything. It's provided for reference / manual setup
-- (e.g. pasting into the Supabase SQL editor).
-- ============================================================

CREATE TYPE "Role"         AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus"   AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLOSED');

-- -------------------- USERS (admins have role = 'ADMIN') --------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(60)  NOT NULL,
    last_name       VARCHAR(60)  NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(20)  NOT NULL,
    password        VARCHAR(255) NOT NULL,               -- bcrypt hash
    role            "Role"       NOT NULL DEFAULT 'USER',
    status          "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMP(3),
    last_active_at  TIMESTAMP(3),
    created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX users_created_at_idx     ON users (created_at);
CREATE INDEX users_last_active_at_idx ON users (last_active_at);

-- -------------------- OTPS (forgot-password codes, hashed) --------------------
CREATE TABLE otps (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp_hash    VARCHAR(255) NOT NULL,                    -- bcrypt-hashed 6-digit code
    attempts    INTEGER      NOT NULL DEFAULT 0,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMP(3) NOT NULL,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX otps_user_id_idx ON otps (user_id);

-- -------------------- LOGIN HISTORY --------------------
CREATE TABLE login_history (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address  VARCHAR(64)  NOT NULL,
    user_agent  VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX login_history_user_id_idx    ON login_history (user_id);
CREATE INDEX login_history_created_at_idx ON login_history (created_at);

-- -------------------- SUPPORT TICKETS --------------------
CREATE TABLE support_tickets (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- null = anonymous
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    subject     VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    status      "TicketStatus" NOT NULL DEFAULT 'OPEN',
    created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX support_tickets_created_at_idx ON support_tickets (created_at);

-- -------------------- DEFAULT ADMIN --------------------
-- Password below is bcrypt("Admin@12345", 12 rounds).
-- Prefer `npm run seed` which generates a fresh hash.
INSERT INTO users (first_name, last_name, email, phone, password, role, status)
VALUES (
  'System', 'Admin', 'admin@company.com', '+10000000000',
  '$2a$12$zJGZZeiNn5F3r7s2DgBrN.7opAEw70Nes4mCr70x90C6HG.Pk/qqu',
  'ADMIN', 'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;
