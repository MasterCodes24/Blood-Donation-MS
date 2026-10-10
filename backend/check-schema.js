require('dotenv').config();
const pool = require('./db');

pool.query(
  "SELECT column_name, character_maximum_length, data_type FROM information_schema.columns WHERE table_name = 'staff' ORDER BY ordinal_position"
).then(r => {
  console.log('staff table columns:');
  console.table(r.rows);
  process.exit(0);
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
