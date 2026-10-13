const pool = require('../config/db');

async function getAllCompanies(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM Companies ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createCompany(req, res, next) {
  try {
    const { name, sector, package_offered } = req.body;
    if (!name) return res.status(400).json({ error: 'Company name is required.' });

    const [result] = await pool.query(
      'INSERT INTO Companies (name, sector, package_offered) VALUES (?, ?, ?)',
      [name, sector || null, package_offered || null]
    );
    res.status(201).json({ company_id: result.insertId, message: 'Company added.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCompanies, createCompany };
