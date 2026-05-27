import { getDb } from './queries/connection.js';

async function test() {
  const db = getDb();
  try {
    const result = await db.execute('SELECT COUNT(*) as count FROM cep_cache');
    console.log('cep_cache rows:', result.rows[0]?.count);
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

test();
