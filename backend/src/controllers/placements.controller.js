const pool = require('../config/db');

// GET /api/placements
async function getAllRecords(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT pr.record_id, pr.status, pr.ctc, pr.updated_at,
              s.roll_no, s.name AS student_name, s.branch,
              d.drive_id, d.drive_date,
              c.company_id, c.name AS company_name
       FROM Placement_Records pr
       JOIN Students s ON s.roll_no = pr.roll_no
       JOIN Placement_Drives d ON d.drive_id = pr.drive_id
       JOIN Companies c ON c.company_id = d.company_id
       ORDER BY pr.updated_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/placements
// body: { roll_no, drive_id, status, ctc }
// Creates the application, or updates it if the student already applied to this drive.
async function upsertRecord(req, res, next) {
  try {
    const { roll_no, drive_id, status, ctc } = req.body;
    if (!roll_no || !drive_id || !status) {
      return res.status(400).json({ error: 'roll_no, drive_id and status are required.' });
    }

    await pool.query(
      `INSERT INTO Placement_Records (roll_no, drive_id, status, ctc)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), ctc = VALUES(ctc)`,
      [roll_no, drive_id, status, ctc ?? null]
    );

    res.status(201).json({ message: 'Placement record saved.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllRecords, upsertRecord };
