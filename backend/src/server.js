const http = require('http');
const { env, assertEnv } = require('./config/env');
assertEnv();

const app = require('./app');
const { initSocket } = require('./socket');
const prisma = require('./config/prisma');

const server = http.createServer(app);
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`\n🚀 Auth App API running on http://localhost:${env.PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   CORS origin : ${env.CLIENT_URL}`);
  console.log(`   Realtime    : Socket.IO ready\n`);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
