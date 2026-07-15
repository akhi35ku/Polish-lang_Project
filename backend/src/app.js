const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { env } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiters');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const learnRoutes = require('./routes/learnRoutes');

const app = express();

// Behind Render/Railway/Vercel proxies: trust X-Forwarded-* for correct IPs + rate limiting
app.set('trust proxy', 1);

/* ---------- Security ---------- */
app.use(helmet());                                   // secure HTTP headers (XSS, sniffing, clickjacking…)
app.use(
  cors({
    origin: env.CLIENT_URL.split(',').map((s) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '100kb' }));           // body size limit
app.use('/api', apiLimiter);                          // global rate limit

/* ---------- Routes ---------- */
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learn', learnRoutes);

/* ---------- Errors ---------- */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
