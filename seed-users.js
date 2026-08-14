require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
  if (superAdminCount === 0) {
    const password = await bcrypt.hash('superadmin123', 10);
    await prisma.user.create({ data: { username: 'superadmin', password, role: 'SUPER_ADMIN' } });
    console.log('Created default superadmin');
  } else {
    console.log('Superadmin already exists');
  }

  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount === 0) {
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.create({ data: { username: 'admin', password, role: 'ADMIN' } });
    console.log('Created default admin');
  } else {
    console.log('Admin already exists');
  }

  const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } });
  if (teacherCount === 0) {
    const password = await bcrypt.hash('teacher123', 10);
    await prisma.user.create({ data: { username: 'teacher', password, role: 'TEACHER' } });
    console.log('Created default teacher');
  } else {
    console.log('Teacher already exists');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
