// Middleware to enforce authentication
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Access denied. Log in first." });
};

module.exports = { ensureAuthenticated };
