const pool = require('../config/db');

// GET /api/students?branch=CSE&minCgpa=7.5&maxBacklogs=0
async function getAllStudents(req, res, next) {
  try {
    const { branch, minCgpa, maxBacklogs } = req.query;
    const conditions = [];
    const params = [];

    if (branch) { conditions.push('branch = ?'); params.push(branch); }
    if (minCgpa) { conditions.push('cgpa >= ?'); params.push(Number(minCgpa)); }
    if (maxBacklogs !== undefined && maxBacklogs !== '') {
      conditions.push('backlogs <= ?'); params.push(Number(maxBacklogs));
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT * FROM Students ${where} ORDER BY name ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getStudentByRoll(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM Students WHERE roll_no = ?', [req.params.rollNo]);
    if (!rows[0]) return res.status(404).json({ error: 'No student found with that roll number.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function createStudent(req, res, next) {
  try {
    const { roll_no, name, branch, cgpa, backlogs, contact } = req.body;
    if (!roll_no || !name || !branch || cgpa === undefined) {
      return res.status(400).json({ error: 'roll_no, name, branch and cgpa are required.' });
    }
    await pool.query(
      'INSERT INTO Students (roll_no, name, branch, cgpa, backlogs, contact) VALUES (?, ?, ?, ?, ?, ?)',
      [roll_no, name, branch, cgpa, backlogs || 0, contact || null]
    );
    res.status(201).json({ message: 'Student added.' });
  } catch (err) {
    next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { name, branch, cgpa, backlogs, contact } = req.body;
    const [result] = await pool.query(
      `UPDATE Students SET
         name = COALESCE(?, name),
         branch = COALESCE(?, branch),
         cgpa = COALESCE(?, cgpa),
         backlogs = COALESCE(?, backlogs),
         contact = COALESCE(?, contact)
       WHERE roll_no = ?`,
      [name, branch, cgpa, backlogs, contact, req.params.rollNo]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No student found with that roll number.' });
    res.json({ message: 'Student updated.' });
  } catch (err) {
    next(err);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM Students WHERE roll_no = ?', [req.params.rollNo]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No student found with that roll number.' });
    res.json({ message: 'Student removed.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/:rollNo/eligible-drives
// Compares the student's cgpa/backlogs/branch against each drive's criteria.
async function getEligibleDrivesForStudent(req, res, next) {
  try {
    const { rollNo } = req.params;
    const [studentRows] = await pool.query('SELECT * FROM Students WHERE roll_no = ?', [rollNo]);
    const student = studentRows[0];
    if (!student) return res.status(404).json({ error: 'No student found with that roll number.' });

    const [drives] = await pool.query(
      `SELECT d.drive_id, d.drive_date, d.min_cgpa, d.max_backlogs,
              c.company_id, c.name AS company_name, c.sector, c.package_offered,
              pr.status AS application_status, pr.ctc AS awarded_ctc
       FROM Placement_Drives d
       JOIN Companies c ON c.company_id = d.company_id
       JOIN Drive_Eligible_Branches deb ON deb.drive_id = d.drive_id AND deb.branch = ?
       LEFT JOIN Placement_Records pr ON pr.drive_id = d.drive_id AND pr.roll_no = ?
       WHERE d.min_cgpa <= ? AND d.max_backlogs >= ?
       ORDER BY d.drive_date ASC`,
      [student.branch, rollNo, student.cgpa, student.backlogs]
    );

    res.json({ student, eligible_drives: drives });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentByRoll,
  createStudent,
  updateStudent,
  deleteStudent,
  getEligibleDrivesForStudent,
};
