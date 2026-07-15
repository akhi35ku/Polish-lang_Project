const prisma = require('../config/prisma');
const { verifyToken } = require('../utils/tokens');

// Protect routes: verifies Bearer JWT, loads the user, blocks disabled accounts,
// and (throttled) refreshes lastActiveAt so "Active Users" stays accurate.
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    if (payload.purpose !== 'auth') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    if (user.status === 'DISABLED') {
      return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact support.' });
    }

    // Throttle lastActiveAt writes to once per minute per user
    if (!user.lastActiveAt || Date.now() - new Date(user.lastActiveAt).getTime() > 60_000) {
      prisma.user
        .update({ where: { id: user.id }, data: { lastActiveAt: new Date() } })
        .catch(() => {});
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
