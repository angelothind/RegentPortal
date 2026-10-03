const jwt = require('jsonwebtoken');

function getAuthPayload(req) {
  const header = req.headers.authorization || '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireTeacherOrAdmin(req, res, next) {
  const payload = getAuthPayload(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (payload.userType !== 'Teacher' && payload.userType !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.auth = payload;
  next();
}

module.exports = { getAuthPayload, requireTeacherOrAdmin };
