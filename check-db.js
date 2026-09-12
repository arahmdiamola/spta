const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.ivajiisurtjxcxyevouv:%23NewPassword2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });
pool.query('SELECT username, role FROM "User"').then(res => {
  console.log('Users in DB:', res.rows);
  pool.end();
}).catch(err => {
  console.error('DB Error:', err.message);
  pool.end();
});
