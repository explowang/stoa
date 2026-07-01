import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const sql = postgres(process.env.DATABASE_URL!);

async function test() {
  try {
    // 测试基本查询
    const result = await sql`SELECT COUNT(*) as count FROM quotes`;
    console.log('Total quotes:', result[0].count);

    // 测试随机查询
    const random = await sql`SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1`;
    console.log('Random quote:', random[0].content);

    // 测试哲学家查询
    const philosophers = await sql`SELECT id, name FROM philosophers LIMIT 3`;
    console.log('Philosophers:', philosophers);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sql.end();
  }
}

test();
