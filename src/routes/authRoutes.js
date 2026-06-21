const express = require("express");
const {
  signup,
  login,
  requireGoogleOAuthConfig,
  googleAuth,
  googleCallback,
  googleFailure
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/google", requireGoogleOAuthConfig, googleAuth);
router.get("/google/callback", requireGoogleOAuthConfig, ...googleCallback);
router.get("/google/failure", googleFailure);

module.exports = router;
