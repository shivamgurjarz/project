const router = require('express').Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/analytics.controller');

router.get('/summary', verifyToken, requireRole('admin'), ctrl.summary);
router.get('/branch-wise', verifyToken, requireRole('admin'), ctrl.branchWise);
router.get('/company-wise', verifyToken, requireRole('admin'), ctrl.companyWise);
router.get('/package-distribution', verifyToken, requireRole('admin'), ctrl.packageDistribution);
router.get('/year-wise', verifyToken, requireRole('admin'), ctrl.yearWise);

module.exports = router;
