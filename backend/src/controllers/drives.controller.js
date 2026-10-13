const pool = require('../config/db');

// GET /api/drives — each drive with its company and eligible branches
async function getAllDrives(req, res, next) {
  try {
    const [drives] = await pool.query(
      `SELECT d.drive_id, d.drive_date, d.min_cgpa, d.max_backlogs,
              c.company_id, c.name AS company_name, c.sector, c.package_offered
       FROM Placement_Drives d
       JOIN Companies c ON c.company_id = d.company_id
       ORDER BY d.drive_date ASC`
    );

    const [branchRows] = await pool.query('SELECT * FROM Drive_Eligible_Branches');
    const branchesByDrive = {};
    branchRows.forEach(({ drive_id, branch }) => {
      (branchesByDrive[drive_id] ||= []).push(branch);
    });

    const result = drives.map(d => ({ ...d, eligible_branches: branchesByDrive[d.drive_id] || [] }));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/drives
// body: { company_id, drive_date, min_cgpa, max_backlogs, branches: ['CSE','IT'] }
async function createDrive(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { company_id, drive_date, min_cgpa, max_backlogs, branches } = req.body;
    if (!company_id || !drive_date || !Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ error: 'company_id, drive_date and at least one branch are required.' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO Placement_Drives (company_id, drive_date, min_cgpa, max_backlogs) VALUES (?, ?, ?, ?)',
      [company_id, drive_date, min_cgpa || 0, max_backlogs || 0]
    );
    const driveId = result.insertId;

    const values = branches.map(b => [driveId, b]);
    await conn.query('INSERT INTO Drive_Eligible_Branches (drive_id, branch) VALUES ?', [values]);

    await conn.commit();
    res.status(201).json({ drive_id: driveId, message: 'Drive scheduled.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// GET /api/drives/:driveId/eligible-students
// The reverse of the student-facing lookup: given a drive, who qualifies?
async function getEligibleStudentsForDrive(req, res, next) {
  try {
    const { driveId } = req.params;
    const [driveRows] = await pool.query('SELECT * FROM Placement_Drives WHERE drive_id = ?', [driveId]);
    const drive = driveRows[0];
    if (!drive) return res.status(404).json({ error: 'No drive found with that ID.' });

    const [students] = await pool.query(
      `SELECT s.*
       FROM Students s
       JOIN Drive_Eligible_Branches deb ON deb.branch = s.branch AND deb.drive_id = ?
       WHERE s.cgpa >= ? AND s.backlogs <= ?
       ORDER BY s.cgpa DESC`,
      [driveId, drive.min_cgpa, drive.max_backlogs]
    );

    res.json({ drive, eligible_students: students });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllDrives, createDrive, getEligibleStudentsForDrive };
