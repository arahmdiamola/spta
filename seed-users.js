const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
  if (superAdminCount === 0) {
    const password = await bcrypt.hash('superadmin123', 10);
    await prisma.user.create({ data: { username: 'superadmin', password, role: 'SUPER_ADMIN' } });
    console.log('Created default superadmin');
  }
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount === 0) {
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.create({ data: { username: 'admin', password, role: 'ADMIN' } });
    console.log('Created default admin');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
