const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, roll_no: user.roll_no },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    let profile = null;
    if (user.role === 'student' && user.roll_no) {
      const [studentRows] = await pool.query('SELECT * FROM Students WHERE roll_no = ?', [user.roll_no]);
      profile = studentRows[0] || null;
    }

    res.json({
      token,
      role: user.role,
      roll_no: user.roll_no,
      username: user.username,
      profile,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
