const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/placements.controller');

router.get('/', verifyToken, requireRole('admin'), ctrl.getAllRecords);
router.post('/', verifyToken, requireRole('admin'), ctrl.upsertRecord);

module.exports = router;
