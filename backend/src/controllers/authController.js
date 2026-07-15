const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { env } = require('../config/env');
const { sendMail } = require('../config/mailer');
const { welcomeEmail, otpEmail, passwordChangedEmail } = require('../utils/emailTemplates');
const { signAuthToken, signResetToken, verifyToken } = require('../utils/tokens');
const { cleanString } = require('../utils/sanitize');
const { emitToAdmins } = require('../socket');

const SALT_ROUNDS = 12;

function publicUser(user) {
  const { password, ...safe } = user;
  return safe;
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

/* ---------------- POST /api/auth/register ---------------- */
async function register(req, res, next) {
  try {
    const { email, phone, password } = req.body;
    const firstName = cleanString(req.body.firstName, 60);
    const lastName = cleanString(req.body.lastName, 60);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, phone, password: hashed },
    });

    // Welcome email — never block registration on email failure
    sendMail({ to: email, ...welcomeEmail(firstName) }).catch((e) =>
      console.error('Welcome email failed:', e.message)
    );

    // Realtime: admin dashboard sees the signup instantly
    emitToAdmins('user:registered', publicUser(user));

    const token = signAuthToken(user, false);
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome email sent!',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/* ---------------- POST /api/auth/login ---------------- */
async function login(req, res, next) {
  try {
    const { email, password, rememberMe = false } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Same message for unknown email and wrong password: prevents user enumeration
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (user.status === 'DISABLED') {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact support.' });
    }

    const [updated, loginRecord] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastActiveAt: new Date() },
      }),
      prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: clientIp(req).slice(0, 64),
          userAgent: cleanString(req.headers['user-agent'] || 'unknown', 255),
        },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
    ]);

    emitToAdmins('login:recorded', loginRecord);

    const token = signAuthToken(updated, Boolean(rememberMe));
    res.json({
      success: true,
      message: `Welcome back, ${user.firstName}!`,
      token,
      user: publicUser(updated),
      expiresIn: rememberMe ? env.JWT_REMEMBER_EXPIRES : env.JWT_EXPIRES,
    });
  } catch (err) {
    next(err);
  }
}

/* ---------------- GET /api/auth/me ---------------- */
async function me(req, res) {
  res.json({ success: true, user: publicUser(req.user) });
}

/* ---------------- POST /api/auth/logout ----------------
   JWTs are stateless; the client discards the token. The endpoint exists so
   the frontend has a single place to hook session-teardown + it updates activity. */
async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully.' });
}

/* ---------------- POST /api/auth/forgot-password ---------------- */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always answer 200 with the same message — prevents user enumeration.
    const genericResponse = {
      success: true,
      message: 'If an account exists for that email, a 6-digit code has been sent.',
    };
    if (!user) return res.json(genericResponse);

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    // One active OTP per user: invalidate previous codes
    await prisma.$transaction([
      prisma.otp.deleteMany({ where: { userId: user.id } }),
      prisma.otp.create({ data: { userId: user.id, otpHash, expiresAt } }),
    ]);

    await sendMail({ to: email, ...otpEmail(user.firstName, otp, env.OTP_EXPIRY_MINUTES) });
    res.json(genericResponse);
  } catch (err) {
    next(err);
  }
}

/* ---------------- POST /api/auth/verify-otp ---------------- */
async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired code.' });

    const record = await prisma.otp.findFirst({
      where: { userId: user.id, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code. Request a new one.' });
    }
    if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Request a new code.' });
    }

    const match = await bcrypt.compare(otp, record.otpHash);
    if (!match) {
      await prisma.otp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      const left = env.OTP_MAX_ATTEMPTS - record.attempts - 1;
      return res.status(400).json({
        success: false,
        message: left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many attempts. Request a new code.',
      });
    }

    await prisma.otp.update({ where: { id: record.id }, data: { used: true } });
    const resetToken = signResetToken(user.id);
    res.json({ success: true, message: 'Code verified. You can now set a new password.', resetToken });
  } catch (err) {
    next(err);
  }
}

/* ---------------- POST /api/auth/reset-password ---------------- */
async function resetPassword(req, res, next) {
  try {
    const { resetToken, newPassword } = req.body;

    let payload;
    try {
      payload = verifyToken(resetToken);
    } catch {
      return res.status(400).json({ success: false, message: 'Reset session expired. Start again.' });
    }
    if (payload.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(400).json({ success: false, message: 'Account not found.' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.otp.deleteMany({ where: { userId: user.id } }),
    ]);

    sendMail({ to: user.email, ...passwordChangedEmail(user.firstName) }).catch(() => {});
    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, logout, forgotPassword, verifyOtp, resetPassword };
