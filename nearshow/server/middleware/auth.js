const jwt = require('jsonwebtoken');

const protect = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token, access denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Access forbidden' });
      }

      req.user = decoded;
      next();

    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = protect;