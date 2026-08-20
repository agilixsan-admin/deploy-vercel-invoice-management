const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const url = 'postgres://postgres.lilblaidgancbxhfiwqr:wumNyq8fRmVDiXv6@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const hash = await bcrypt.hash('admin123', 10);
  
  // Create user
  await client.query(`
    INSERT INTO "users" (id, full_name, email, password_hash, role)
    VALUES (gen_random_uuid(), 'Super Administrator', 'admin@agilix.com', $1, 'SUPER_ADMIN')
    ON CONFLICT (email) DO NOTHING
  `, [hash]);

  console.log('seeded');
  await client.end();
}
seed();
