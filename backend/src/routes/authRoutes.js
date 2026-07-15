const router = require('express').Router();
const {
  register, login, me, logout, forgotPassword, verifyOtp, resetPassword,
} = require('../controllers/authController');
const {
  registerValidator, loginValidator, forgotPasswordValidator, verifyOtpValidator, resetPasswordValidator,
} = require('../validators/authValidators');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiters');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);
router.post('/forgot-password', otpLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOtpValidator, validate, verifyOtp);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, resetPassword);

module.exports = router;
