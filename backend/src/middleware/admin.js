// Must run after requireAuth. Only ADMIN role may pass.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin access only.' });
  }
  next();
}

module.exports = { requireAdmin };
