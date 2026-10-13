/**
 * Creates the Users rows that sql/seed.sql intentionally leaves out,
 * because passwords need to be hashed in JavaScript, not plain SQL.
 *
 * Usage (after schema.sql and seed.sql have been run):
 *   cd backend
 *   npm install
 *   npm run seed:users
 *
 * Creates:
 *   - one admin login, from ADMIN_USERNAME / ADMIN_PASSWORD in .env
 *   - one student login per row already in the Students table,
 *     using the roll number as both username and initial password
 *     (students should be told to change it after first login).
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function run() {
  const adminUsername = process.env.ADMIN_USERNAME || 'tpc-admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-after-first-login';

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await pool.query(
    `INSERT INTO Users (username, password_hash, role, roll_no)
     VALUES (?, ?, 'admin', NULL)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [adminUsername, adminHash]
  );
  console.log(`Admin user ready: ${adminUsername}`);

  const [students] = await pool.query('SELECT roll_no FROM Students');
  for (const { roll_no } of students) {
    const hash = await bcrypt.hash(roll_no, 10); // initial password = roll number
    await pool.query(
      `INSERT INTO Users (username, password_hash, role, roll_no)
       VALUES (?, ?, 'student', ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [roll_no, hash, roll_no]
    );
  }
  console.log(`${students.length} student login(s) ready (username = roll number, initial password = roll number).`);

  await pool.end();
}

run().catch(err => {
  console.error('Failed to seed users:', err);
  process.exit(1);
});
