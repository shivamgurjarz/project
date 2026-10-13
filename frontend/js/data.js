/**
 * data.js
 * -----------------------------------------------------------
 * Stand-in data layer. Every function here mirrors an endpoint
 * this app will eventually call on the Express/MySQL backend:
 *
 *   getStudents()          -> GET  /api/students
 *   getCompanies()         -> GET  /api/companies
 *   getDrives()            -> GET  /api/drives
 *   getPlacementRecords()  -> GET  /api/placements
 *
 * Keeping the shape identical to the planned DB schema
 * (Students, Companies, Placement_Drives, Placement_Records)
 * means swapping localStorage/mock arrays for real fetch()
 * calls later shouldn't require touching the UI code.
 * -----------------------------------------------------------
 */

const STORAGE_KEY = 'spas_mock_db_v1';

const seedData = {
  students: [
    { roll_no: '2302300100153', name: 'Shivam Chauhan', branch: 'CSE', cgpa: 8.4, backlogs: 0, contact: 'shivam@example.edu' },
    { roll_no: '2302300100184', name: 'Vansh Tomar', branch: 'CSE', cgpa: 7.9, backlogs: 0, contact: 'vansh@example.edu' },
    { roll_no: '2302300100016', name: 'Aman Chaudhary', branch: 'CSE', cgpa: 8.1, backlogs: 0, contact: 'aman@example.edu' },
    { roll_no: '2302300100201', name: 'Riya Sharma', branch: 'IT', cgpa: 9.0, backlogs: 0, contact: 'riya@example.edu' },
    { roll_no: '2302300100207', name: 'Kabir Mehta', branch: 'ECE', cgpa: 6.8, backlogs: 1, contact: 'kabir@example.edu' },
    { roll_no: '2302300100219', name: 'Neha Verma', branch: 'CSE', cgpa: 8.8, backlogs: 0, contact: 'neha@example.edu' },
    { roll_no: '2302300100233', name: 'Arjun Rao', branch: 'ME', cgpa: 7.2, backlogs: 0, contact: 'arjun@example.edu' },
    { roll_no: '2302300100240', name: 'Simran Kaur', branch: 'IT', cgpa: 8.6, backlogs: 0, contact: 'simran@example.edu' },
  ],

  companies: [
    { company_id: 'C1', name: 'Northbridge Systems', sector: 'Software', package_offered: 9.5 },
    { company_id: 'C2', name: 'Vertex Analytics', sector: 'Data / Analytics', package_offered: 12.0 },
    { company_id: 'C3', name: 'Kesari Manufacturing', sector: 'Core Engineering', package_offered: 6.5 },
    { company_id: 'C4', name: 'Lumen Cloud', sector: 'Software', package_offered: 15.2 },
  ],

  drives: [
    { drive_id: 'D1', company_id: 'C1', date: '2026-08-14', eligibility: { min_cgpa: 7.0, max_backlogs: 0, branches: ['CSE', 'IT'] } },
    { drive_id: 'D2', company_id: 'C2', date: '2026-08-22', eligibility: { min_cgpa: 8.0, max_backlogs: 0, branches: ['CSE', 'IT', 'ECE'] } },
    { drive_id: 'D3', company_id: 'C3', date: '2026-09-02', eligibility: { min_cgpa: 6.0, max_backlogs: 1, branches: ['ME', 'ECE'] } },
    { drive_id: 'D4', company_id: 'C4', date: '2026-09-10', eligibility: { min_cgpa: 8.5, max_backlogs: 0, branches: ['CSE', 'IT'] } },
  ],

  placements: [
    { record_id: 'R1', roll_no: '2302300100153', drive_id: 'D1', status: 'Placed', ctc: 9.5 },
    { record_id: 'R2', roll_no: '2302300100219', drive_id: 'D2', status: 'Placed', ctc: 12.0 },
    { record_id: 'R3', roll_no: '2302300100201', drive_id: 'D4', status: 'Placed', ctc: 15.2 },
    { record_id: 'R4', roll_no: '2302300100240', drive_id: 'D4', status: 'In Process', ctc: null },
    { record_id: 'R5', roll_no: '2302300100233', drive_id: 'D3', status: 'Placed', ctc: 6.5 },
    { record_id: 'R6', roll_no: '2302300100184', drive_id: 'D1', status: 'In Process', ctc: null },
  ],
};

function loadDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* fall through to reseed */ }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return JSON.parse(JSON.stringify(seedData));
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

const DB = {
  getStudents() { return loadDB().students; },
  getCompanies() { return loadDB().companies; },
  getDrives() { return loadDB().drives; },
  getPlacementRecords() { return loadDB().placements; },

  getCompanyById(id) { return this.getCompanies().find(c => c.company_id === id); },
  getStudentByRoll(roll) { return this.getStudents().find(s => s.roll_no === roll); },
  getDriveById(id) { return this.getDrives().find(d => d.drive_id === id); },

  addStudent(student) {
    const db = loadDB();
    db.students.push(student);
    saveDB(db);
  },

  isEligible(student, drive) {
    const e = drive.eligibility;
    return student.cgpa >= e.min_cgpa
      && student.backlogs <= e.max_backlogs
      && e.branches.includes(student.branch);
  },

  eligibleDrivesFor(roll) {
    const student = this.getStudentByRoll(roll);
    if (!student) return [];
    return this.getDrives().filter(d => this.isEligible(student, d));
  },

  recordFor(roll) {
    return this.getPlacementRecords().find(r => r.roll_no === roll);
  },

  addDrive(drive) {
    const db = loadDB();
    db.drives.push(drive);
    saveDB(db);
  },

  addCompany(company) {
    const db = loadDB();
    db.companies.push(company);
    saveDB(db);
  },

  resetToSeed() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  },
};
