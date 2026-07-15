const { Server } = require('socket.io');
const { verifyToken } = require('./utils/tokens');
const { env } = require('./config/env');

let io = null;

/* Realtime layer.
   Admin clients connect with their JWT; verified ADMIN sockets join the
   "admins" room and instantly receive: user:registered, user:updated,
   user:deleted, ticket:created, ticket:updated, login:recorded. */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL.split(','), credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('unauthorized'));
      const payload = verifyToken(token);
      if (payload.purpose !== 'auth') return next(new Error('unauthorized'));
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.data.role === 'ADMIN') socket.join('admins');
  });

  return io;
}

function emitToAdmins(event, payload) {
  if (io) io.to('admins').emit(event, payload);
}

module.exports = { initSocket, emitToAdmins };
