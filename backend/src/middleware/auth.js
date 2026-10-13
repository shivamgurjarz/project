const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Sign in to access this resource.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { user_id, role, roll_no }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session has expired. Sign in again.' });
  }
}

// Usage: requireRole('admin') or requireRole('admin', 'student')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do that.' });
    }
    next();
  };
}

// For routes a student may only use on their own record
// (e.g. GET /api/students/:rollNo/eligible-drives)
function ownRecordOrAdmin(paramName = 'rollNo') {
  return (req, res, next) => {
    if (req.user.role === 'admin') return next();
    if (req.user.role === 'student' && req.user.roll_no === req.params[paramName]) return next();
    return res.status(403).json({ error: 'You can only view your own record.' });
  };
}

module.exports = { verifyToken, requireRole, ownRecordOrAdmin };
