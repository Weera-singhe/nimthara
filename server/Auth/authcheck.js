// middleware/auth.js

function getUserID(req) {
  return req.user?.id || null;
}

function requiredLogged(req, res, next) {
  if (req.isAuthenticated?.() && req.user) return next();

  return res.status(401).json({
    success: false,
    message: "Please Log In",
  });
}

function requiredLevel(req, res, fieldName, minLevel) {
  const lvl = Number(req.user?.[fieldName]) || 0;

  if (lvl < minLevel) {
    res.status(403).json({
      success: false,
      message: "Forbidden",
    });
    return false;
  }
  return true;
}

module.exports = { getUserID, requiredLogged, requiredLevel };
