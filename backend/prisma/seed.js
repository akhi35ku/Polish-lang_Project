/* Seeds the default admin account.
   Run:  npm run seed   (or: npx prisma db seed)
   Email:    admin@company.com
   Password: Admin@12345
   ⚠️ Change this password immediately in production. */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@company.com';
  const password = await bcrypt.hash('Admin@12345', 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      firstName: 'System',
      lastName: 'Admin',
      email,
      phone: '+10000000000',
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Admin ready: ${admin.email} (id ${admin.id})`);
  console.log('   Password: Admin@12345 — change it in production!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
