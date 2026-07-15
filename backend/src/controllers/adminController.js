const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { toCsv } = require('../utils/csv');
const { emitToAdmins } = require('../socket');

const SALT_ROUNDS = 12;
const ACTIVE_WINDOW_MINUTES = 15;

function publicUser(u) {
  const { password, ...safe } = u;
  return safe;
}

/* ---------------- GET /api/admin/stats ---------------- */
async function stats(req, res, next) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_MINUTES * 60 * 1000);

    const [totalUsers, todaysRegistrations, totalTickets, openTickets, activeUsers, latestUsers, recentLogins] =
      await prisma.$transaction([
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.user.count({ where: { role: 'USER', createdAt: { gte: startOfToday } } }),
        prisma.supportTicket.count(),
        prisma.supportTicket.count({ where: { status: 'OPEN' } }),
        prisma.user.count({ where: { role: 'USER', lastActiveAt: { gte: activeSince } } }),
        prisma.user.findMany({
          where: { role: 'USER' },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, status: true },
        }),
        prisma.loginHistory.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        }),
      ]);

    res.json({
      success: true,
      stats: { totalUsers, todaysRegistrations, totalTickets, openTickets, activeUsers },
      latestUsers,
      recentLogins,
    });
  } catch (err) {
    next(err);
  }
}

/* ---------------- GET /api/admin/users?search=&page=&limit= ---------------- */
async function listUsers(req, res, next) {
  try {
    const search = (req.query.search || '').trim();
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const where = {
      role: 'USER',
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          status: true, createdAt: true, lastLoginAt: true, lastActiveAt: true,
        },
      }),
    ]);

    res.json({ success: true, users, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    next(err);
  }
}

/* ---------------- DELETE /api/admin/users/:id ---------------- */
async function deleteUser(req, res, next) {
  try {
    const id = req.params.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted from the panel.' });
    }

    // OTPs and login history cascade via Prisma relations; tickets keep a null link
    await prisma.user.delete({ where: { id } });
    emitToAdmins('user:deleted', { id });
    res.json({ success: true, message: `Deleted ${user.email}.` });
  } catch (err) {
    next(err);
  }
}

/* ---------------- PATCH /api/admin/users/:id/status ---------------- */
async function setUserStatus(req, res, next) {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be disabled.' });
    }

    const updated = await prisma.user.update({ where: { id }, data: { status } });
    emitToAdmins('user:updated', publicUser(updated));
    res.json({
      success: true,
      message: `${user.email} is now ${status === 'ACTIVE' ? 'enabled' : 'disabled'}.`,
      user: publicUser(updated),
    });
  } catch (err) {
    next(err);
  }
}

/* ---------------- POST /api/admin/users/:id/reset-password ---------------- */
async function adminResetPassword(req, res, next) {
  try {
    const id = req.params.id;
    const { newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { password: hashed } }),
      prisma.otp.deleteMany({ where: { userId: id } }),
    ]);
    res.json({ success: true, message: `Password reset for ${user.email}.` });
  } catch (err) {
    next(err);
  }
}

/* ---------------- GET /api/admin/tickets ---------------- */
async function listTickets(req, res, next) {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    res.json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
}

/* ---------------- PATCH /api/admin/tickets/:id/status ---------------- */
async function setTicketStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const status = req.body.status === 'CLOSED' ? 'CLOSED' : 'OPEN';
    const ticket = await prisma.supportTicket.update({ where: { id }, data: { status } });
    emitToAdmins('ticket:updated', ticket);
    res.json({ success: true, message: `Ticket #${id} marked ${status.toLowerCase()}.`, ticket });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ success: false, message: 'Ticket not found.' });
    next(err);
  }
}

/* ---------------- GET /api/admin/logins ---------------- */
async function listLogins(req, res, next) {
  try {
    const logins = await prisma.loginHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, logins });
  } catch (err) {
    next(err);
  }
}

/* ---------------- GET /api/admin/export/users ---------------- */
async function exportUsersCsv(req, res, next) {
  try {
    const users = await prisma.user.findMany({ where: { role: 'USER' }, orderBy: { createdAt: 'asc' } });
    const csv = toCsv(
      ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Registered At', 'Last Login'],
      users.map((u) => [
        u.id, u.firstName, u.lastName, u.email, u.phone, u.status,
        u.createdAt.toISOString(), u.lastLoginAt ? u.lastLoginAt.toISOString() : '',
      ])
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

/* ---------------- GET /api/admin/export/tickets ---------------- */
async function exportTicketsCsv(req, res, next) {
  try {
    const tickets = await prisma.supportTicket.findMany({ orderBy: { createdAt: 'asc' } });
    const csv = toCsv(
      ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'Created At'],
      tickets.map((t) => [t.id, t.name, t.email, t.subject, t.message, t.status, t.createdAt.toISOString()])
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="support-tickets-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  stats,
  listUsers,
  deleteUser,
  setUserStatus,
  adminResetPassword,
  listTickets,
  setTicketStatus,
  listLogins,
  exportUsersCsv,
  exportTicketsCsv,
};
