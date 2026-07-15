const router = require('express').Router();
const admin = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { validate } = require('../middleware/validate');
const {
  userIdParam, statusValidator, adminResetPasswordValidator, listUsersValidator,
} = require('../validators/adminValidators');

// Every admin route: JWT auth + ADMIN role
router.use(requireAuth, requireAdmin);

router.get('/stats', admin.stats);
router.get('/users', listUsersValidator, validate, admin.listUsers);
router.delete('/users/:id', userIdParam, validate, admin.deleteUser);
router.patch('/users/:id/status', statusValidator, validate, admin.setUserStatus);
router.post('/users/:id/reset-password', adminResetPasswordValidator, validate, admin.adminResetPassword);
router.get('/tickets', admin.listTickets);
router.patch('/tickets/:id/status', admin.setTicketStatus);
router.get('/logins', admin.listLogins);
router.get('/export/users', admin.exportUsersCsv);
router.get('/export/tickets', admin.exportTicketsCsv);

module.exports = router;
