const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/drives.controller');

router.get('/', verifyToken, ctrl.getAllDrives);
router.post('/', verifyToken, requireRole('admin'), ctrl.createDrive);
router.get('/:driveId/eligible-students', verifyToken, requireRole('admin'), ctrl.getEligibleStudentsForDrive);

module.exports = router;
