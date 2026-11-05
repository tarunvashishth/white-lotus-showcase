import pg from 'pg';
import 'dotenv/config';

// BIGINT (price) arrives as a string by default; rupee prices fit safely in a JS number.
pg.types.setTypeParser(20, (v) => Number(v));

const url = process.env.DATABASE_URL || 'postgres://localhost:5432/whitelotus';
const isLocal = /@(localhost|127\.0\.0\.1)|\/\/(localhost|127\.0\.0\.1)/.test(url);

export const pool = new pg.Pool({
  connectionString: url,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: isLocal ? 10 : 3, // serverless: keep connections per function instance low
});

export const query = (text, params) => pool.query(text, params);
