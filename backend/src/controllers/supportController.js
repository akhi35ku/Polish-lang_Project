const prisma = require('../config/prisma');
const { cleanString } = require('../utils/sanitize');
const { emitToAdmins } = require('../socket');
const { verifyToken } = require('../utils/tokens');

/* ---------------- POST /api/support ----------------
   Public endpoint. If the visitor is logged in (optional Bearer token),
   the ticket is linked to their account. */
async function createTicket(req, res, next) {
  try {
    const name = cleanString(req.body.name, 120);
    const subject = cleanString(req.body.subject, 200);
    const message = cleanString(req.body.message, 5000);
    const { email } = req.body;

    // Optional auth: link ticket to user when a valid token is present
    let userId = null;
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      try {
        const payload = verifyToken(header.slice(7));
        if (payload.purpose === 'auth') userId = payload.sub;
      } catch {
        /* anonymous ticket */
      }
    }

    const ticket = await prisma.supportTicket.create({
      data: { name, email, subject, message, userId },
    });

    emitToAdmins('ticket:created', ticket);
    res.status(201).json({
      success: true,
      message: `Ticket #${ticket.id} created. Our team will reply to ${email}.`,
      ticket,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTicket };
