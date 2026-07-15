const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function signAuthToken(user, rememberMe = false) {
  return jwt.sign(
    { sub: user.id, role: user.role, purpose: 'auth' },
    env.JWT_SECRET,
    { expiresIn: rememberMe ? env.JWT_REMEMBER_EXPIRES : env.JWT_EXPIRES }
  );
}

function signResetToken(userId) {
  return jwt.sign({ sub: userId, purpose: 'reset' }, env.JWT_SECRET, {
    expiresIn: env.JWT_RESET_EXPIRES,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signAuthToken, signResetToken, verifyToken };
