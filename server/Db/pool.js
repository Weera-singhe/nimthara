const { Pool, types } = require("pg");

types.setTypeParser(1082, (v) => v); // DATE
types.setTypeParser(1114, (v) => v); // TIMESTAMP
types.setTypeParser(1184, (v) => v); // optional: TIMESTAMPTZ

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
