const pool = require('../config/db');

// GET /api/analytics/branch-wise
async function branchWise(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         s.branch,
         COUNT(DISTINCT s.roll_no) AS total_students,
         COUNT(DISTINCT CASE WHEN pr.status = 'Placed' THEN pr.roll_no END) AS placed_students,
         ROUND(
           COUNT(DISTINCT CASE WHEN pr.status = 'Placed' THEN pr.roll_no END)
           / COUNT(DISTINCT s.roll_no) * 100, 2
         ) AS placement_pct
       FROM Students s
       LEFT JOIN Placement_Records pr ON pr.roll_no = s.roll_no
       GROUP BY s.branch
       ORDER BY placement_pct DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/company-wise
async function companyWise(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.company_id, c.name AS company_name, c.sector,
              COUNT(pr.record_id) AS offers_made
       FROM Companies c
       JOIN Placement_Drives d ON d.company_id = c.company_id
       LEFT JOIN Placement_Records pr ON pr.drive_id = d.drive_id AND pr.status = 'Placed'
       GROUP BY c.company_id
       ORDER BY offers_made DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/package-distribution
async function packageDistribution(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         CASE
           WHEN ctc < 6 THEN '< 6 LPA'
           WHEN ctc >= 6  AND ctc < 10 THEN '6 - 10 LPA'
           WHEN ctc >= 10 AND ctc < 15 THEN '10 - 15 LPA'
           ELSE '15+ LPA'
         END AS bucket,
         COUNT(*) AS student_count
       FROM Placement_Records
       WHERE status = 'Placed' AND ctc IS NOT NULL
       GROUP BY bucket`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/summary — headline numbers for the top of the dashboard
async function summary(req, res, next) {
  try {
    const [[{ total_students }]] = await pool.query('SELECT COUNT(*) AS total_students FROM Students');
    const [[{ total_placed }]] = await pool.query(
      "SELECT COUNT(DISTINCT roll_no) AS total_placed FROM Placement_Records WHERE status = 'Placed'"
    );
    const [[{ avg_ctc }]] = await pool.query(
      "SELECT ROUND(AVG(ctc), 2) AS avg_ctc FROM Placement_Records WHERE status = 'Placed'"
    );
    const [[{ highest_ctc }]] = await pool.query(
      "SELECT MAX(ctc) AS highest_ctc FROM Placement_Records WHERE status = 'Placed'"
    );
    const [[{ total_companies }]] = await pool.query('SELECT COUNT(*) AS total_companies FROM Companies');

    res.json({ total_students, total_placed, avg_ctc, highest_ctc, total_companies });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/year-wise — placements grouped by the year of the drive
async function yearWise(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT YEAR(d.drive_date) AS year, COUNT(pr.record_id) AS placed_count
       FROM Placement_Records pr
       JOIN Placement_Drives d ON d.drive_id = pr.drive_id
       WHERE pr.status = 'Placed'
       GROUP BY YEAR(d.drive_date)
       ORDER BY year ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { branchWise, companyWise, packageDistribution, summary, yearWise };
