const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/companies.controller');

// Anyone signed in can browse companies; only the coordinator adds them.
router.get('/', verifyToken, ctrl.getAllCompanies);
router.post('/', verifyToken, requireRole('admin'), ctrl.createCompany);

module.exports = router;
