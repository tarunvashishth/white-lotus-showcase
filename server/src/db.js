import pg from 'pg';
import 'dotenv/config';

// BIGINT (price) arrives as a string by default; rupee prices fit safely in a JS number.
pg.types.setTypeParser(20, (v) => Number(v));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/whitelotus',
});

export const query = (text, params) => pool.query(text, params);
