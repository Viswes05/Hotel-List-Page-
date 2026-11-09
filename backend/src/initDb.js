const fs = require('fs');
const path = require('path');
const pool = require('./db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database schema is ready.');
  } catch (err) {
    console.error('Failed to initialise database:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
