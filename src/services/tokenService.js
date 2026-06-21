const jwt = require("jsonwebtoken");

const createToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

module.exports = { createToken };