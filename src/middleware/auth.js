const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

const authenticate = (req, _res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized request"));
  }

  const token = bearerToken.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (_error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden: insufficient permission"));
  }

  return next();
};

module.exports = { authenticate, authorize };