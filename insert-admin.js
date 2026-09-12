const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgresql://postgres.ivajiisurtjxcxyevouv:%23NewPassword2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });

async function insertAdmin() {
  try {
    const password = await bcrypt.hash('admin123', 10);
    // Use raw query to insert since we don't want to mess with Prisma client instantiation here
    const res = await pool.query(
      `INSERT INTO "User" (id, username, password, role, "updatedAt") 
       VALUES (gen_random_uuid(), 'admin', $1, 'ADMIN', NOW())
       ON CONFLICT (username) DO NOTHING`,
      [password]
    );
    console.log('Inserted admin user:', res.rowCount);
  } catch (err) {
    console.error('Error inserting admin:', err.message);
  } finally {
    pool.end();
  }
}

insertAdmin();
