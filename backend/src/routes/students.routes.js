const router = require('express').Router();
const { verifyToken, requireRole, ownRecordOrAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/students.controller');

// Only the placement cell manages the full roster and its filters.
router.get('/', verifyToken, requireRole('admin'), ctrl.getAllStudents);
router.post('/', verifyToken, requireRole('admin'), ctrl.createStudent);
router.put('/:rollNo', verifyToken, requireRole('admin'), ctrl.updateStudent);
router.delete('/:rollNo', verifyToken, requireRole('admin'), ctrl.deleteStudent);

// A student can view their own record; the coordinator can view any record.
router.get('/:rollNo', verifyToken, ownRecordOrAdmin('rollNo'), ctrl.getStudentByRoll);
router.get('/:rollNo/eligible-drives', verifyToken, ownRecordOrAdmin('rollNo'), ctrl.getEligibleDrivesForStudent);

module.exports = router;
