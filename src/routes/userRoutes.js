const express = require("express");
const { getCurrentUser, updateProfile, getStudentDashboard } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLE } = require("../utils/roles");

const router = express.Router();

router.get("/me", authenticate, getCurrentUser);
router.patch("/me", authenticate, updateProfile);
router.get("/student/dashboard", authenticate, authorize(ROLE.STUDENT), getStudentDashboard);

module.exports = router;