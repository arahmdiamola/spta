const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgresql://postgres.ivajiisurtjxcxyevouv:%23NewPassword2026@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });

async function check() {
  try {
    const res = await pool.query('SELECT username, password FROM "User" WHERE username = \'superadmin\'');
    if (res.rows.length > 0) {
      const user = res.rows[0];
      const match = await bcrypt.compare('superadmin123', user.password);
      console.log('Password match for superadmin123:', match);
      
      const adminRes = await pool.query('SELECT username, password FROM "User" WHERE username = \'treasurer\'');
      if (adminRes.rows.length > 0) {
        console.log('Found treasurer');
      }
    } else {
      console.log('Superadmin not found!');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
